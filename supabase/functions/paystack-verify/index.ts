// Called by the return page after Paystack redirects back. Verifies with Paystack and issues the licence.
// Deploy:  supabase functions deploy paystack-verify
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders, fulfil, verifyWithPaystack } from '../_shared/paystack.ts';

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('origin'));
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) return reply({ error: 'Payments are not configured yet.' }, 500);
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
    });
    const { data: u } = await asUser.auth.getUser();
    if (!u.user) return reply({ error: 'Please sign in to continue.' }, 401);

    const { reference } = await req.json();
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: order } = await db.from('orders').select('user_id').eq('reference', String(reference)).maybeSingle();
    if (!order) return reply({ error: 'Order not found.' }, 404);
    if (order.user_id !== u.user.id) {
      const { data: me } = await db.from('profiles').select('role').eq('id', u.user.id).maybeSingle();
      if (me?.role !== 'admin') return reply({ error: 'Order not found.' }, 404);
    }

    const tx = await verifyWithPaystack(secret, String(reference));
    const result = await fulfil(db, tx);
    return reply({ status: result.order?.status ?? 'awaiting_payment', paystackStatus: tx.status, reason: result.reason ?? null });
  } catch (e) {
    console.error('paystack-verify', e);
    return reply({ error: 'Could not confirm the payment yet.' }, 500);
  }
});
