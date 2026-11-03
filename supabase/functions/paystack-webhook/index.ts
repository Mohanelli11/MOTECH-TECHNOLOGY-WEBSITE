// Paystack -> server notification. Deploy WITHOUT JWT checking (Paystack has no Supabase token):
//   supabase functions deploy paystack-webhook --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { fulfil, validSignature, verifyWithPaystack } from '../_shared/paystack.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!secret) return new Response('Not configured', { status: 500 });

  const raw = await req.text();
  if (!(await validSignature(raw, req.headers.get('x-paystack-signature'), secret)))
    return new Response('Invalid signature', { status: 401 });

  try {
    const event = JSON.parse(raw);
    if (event.event === 'charge.success' && event.data?.reference) {
      // Never trust the payload alone: confirm with Paystack, then fulfil.
      const tx = await verifyWithPaystack(secret, event.data.reference);
      const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await fulfil(db, tx);
    }
    return new Response('ok');
  } catch (e) {
    console.error('paystack-webhook', e);
    return new Response('error', { status: 500 }); // Paystack retries on non-200
  }
});
