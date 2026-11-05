// Creates an order from the SERVER-SIDE price and starts a Paystack checkout.
// Deploy:  supabase functions deploy paystack-init
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { ALLOWED_ORIGINS, corsHeaders, paystackFetch, randomId } from '../_shared/paystack.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);
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

    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile } = await db.from('profiles').select('id,email,disabled').eq('id', u.user.id).maybeSingle();
    if (!profile || profile.disabled) return reply({ error: 'This account cannot place orders.' }, 403);

    const { productId, origin: siteOrigin } = await req.json();
    // Student-marketplace projects live in their own table; everything else uses the main price list.
    let product: { id: string; name: string; price: number; currency: string; status: string } | null = null;
    if (String(productId).startsWith('prj-')) {
      const { data: prj } = await db.from('student_projects').select('id,title,price,currency,status').eq('id', String(productId)).maybeSingle();
      if (prj) product = { id: prj.id, name: prj.title, price: prj.price, currency: prj.currency, status: prj.status === 'available' ? 'available' : 'disabled' };
    } else {
      const { data: row } = await db.from('product_prices').select('*').eq('id', String(productId)).maybeSingle();
      product = row;
    }
    if (!product || product.status === 'disabled') return reply({ error: 'This product is not currently available.' }, 400);

    const base = ALLOWED_ORIGINS.includes(siteOrigin) ? siteOrigin : ALLOWED_ORIGINS[0];
    const year = new Date().getFullYear();
    const order = {
      id: `MT-ORD-${year}-${randomId(6)}`,
      reference: `MTPAY-${randomId(10)}`,
      user_id: profile.id,
      product_id: product.id,
      product_name: product.name,
      amount: product.price,
      currency: product.currency,
      status: 'awaiting_payment'
    };
    const { error: insErr } = await db.from('orders').insert(order);
    if (insErr) return reply({ error: 'Could not create the order. Please try again.' }, 500);

    const tx = await paystackFetch(secret, '/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: profile.email,
        amount: Math.round(Number(product.price) * 100),
        currency: product.currency,
        reference: order.reference,
        callback_url: `${base}/payment/complete`,
        metadata: { order_id: order.id, product_id: product.id, user_id: profile.id }
      })
    });
    return reply({ authorizationUrl: tx.authorization_url, order });
  } catch (e) {
    console.error('paystack-init', e);
    return reply({ error: 'Could not start the payment. Please try again.' }, 500);
  }
});
