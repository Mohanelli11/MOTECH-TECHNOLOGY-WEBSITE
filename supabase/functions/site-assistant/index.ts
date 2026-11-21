// MOTECH website AI assistant (Claude). Deploy:  supabase functions deploy site-assistant --use-api
// Secrets needed: ANTHROPIC_API_KEY   (optional: ANTHROPIC_MODEL, default claude-sonnet-5-5)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/paystack.ts';
import { AssistantError, LIMITS, cleanHistory, converse, isAdmin, systemPrompt } from '../_shared/assistant.ts';
import { KNOWLEDGE } from './knowledge.ts';

const HOURLY = { visitor: 20, user: 60, global: 1500 }; // requests; keeps the Anthropic bill predictable

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('origin'));
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return reply({ error: 'The assistant is not configured yet.' }, 503);

    const url = Deno.env.get('SUPABASE_URL')!;
    const auth = req.headers.get('Authorization') ?? '';
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const serviceDb = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: u } = await asUser.auth.getUser(); // visitors send the public anon key, so this is null for them
    const userId = u.user?.id ?? null;

    const body = await req.json().catch(() => ({}));
    const messages = cleanHistory(body.messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user')
      return reply({ error: 'Please type a question.' }, 400);

    // Spend protection: per-person and global hourly limits (SQL function in supabase/assistant.sql).
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    const checks: Array<[string, number]> = [
      [userId ? `u:${userId}` : `ip:${ip}`, userId ? HOURLY.user : HOURLY.visitor],
      ['global', HOURLY.global]
    ];
    for (const [bucket, limit] of checks) {
      const { data: ok, error } = await serviceDb.rpc('assistant_rate_check', { p_bucket: bucket, p_limit: limit });
      if (error) console.error('rate check', error.message); // fail open on infrastructure errors, closed on real limits
      else if (ok === false)
        return reply({ error: 'You have reached the hourly question limit. Please try again later, or contact MOTECH directly.' }, 429);
    }

    const admin = await isAdmin(serviceDb, userId);
    let name: string | null = null;
    if (userId) {
      const { data: p } = await serviceDb.from('profiles').select('name').eq('id', userId).maybeSingle();
      name = p?.name ? String(p.name).split(' ')[0] : null;
    }
    const path = typeof body.path === 'string' ? body.path.slice(0, 120).replace(/[^\w/#.-]/g, '') : '/';

    const out = await converse({
      apiKey,
      model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5',
      system: systemPrompt(KNOWLEDGE, { name, signedIn: !!userId, admin }, path),
      messages,
      ctx: { userDb: userId ? asUser : null, serviceDb, userId, path },
      admin
    });
    return reply({ reply: out.reply, actions: out.actions, limit: LIMITS.maxMessages });
  } catch (e) {
    console.error('site-assistant', e);
    if (e instanceof AssistantError && e.code === 'not_configured') return reply({ error: 'The assistant is not configured yet.' }, 503);
    if (e instanceof AssistantError && e.code === 'busy') return reply({ error: 'The assistant is busy right now. Please try again in a moment.' }, 503);
    return reply({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
