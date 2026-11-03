// Shared Paystack logic. Pure TypeScript (fetch + Web Crypto only) so it runs in Deno
// Edge Functions and is unit-testable in Node.

export const ALLOWED_ORIGINS = ['https://motechenergyembedded.com', 'https://www.motechenergyembedded.com'];

export const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin'
});

export function randomId(len: number, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/** Paystack signs the raw webhook body with HMAC-SHA512 using the secret key. */
export async function validSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)));
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export type PaystackTx = {
  status: string;
  reference: string;
  amount: number; // subunit (cents)
  currency: string;
  id?: number;
  channel?: string;
};

export async function paystackFetch(secret: string, path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === false) throw new Error(json.message || `Paystack error ${res.status}`);
  return json.data;
}

export const verifyWithPaystack = (secret: string, reference: string): Promise<PaystackTx> =>
  paystackFetch(secret, `/transaction/verify/${encodeURIComponent(reference)}`);

type OrderRow = {
  id: string;
  reference: string;
  user_id: string;
  product_id: string;
  amount: number | string;
  currency: string;
  status: string;
  license_id: string | null;
};

/** Minimal slice of the supabase-js client that fulfilment needs (lets tests inject a fake). */
export interface Db {
  from(table: string): any;
}

/**
 * Idempotently mark an order paid and issue its licence — but ONLY if Paystack says the
 * transaction succeeded for exactly the order's amount and currency.
 */
export async function fulfil(db: Db, tx: PaystackTx): Promise<{ order: OrderRow | null; fulfilled: boolean; reason?: string }> {
  const { data: order } = await db.from('orders').select('*').eq('reference', tx.reference).maybeSingle();
  if (!order) return { order: null, fulfilled: false, reason: 'unknown reference' };
  if (order.status === 'verified') return { order, fulfilled: true };
  if (tx.status !== 'success') return { order, fulfilled: false, reason: `payment ${tx.status}` };

  const expected = Math.round(Number(order.amount) * 100);
  if (tx.amount !== expected || tx.currency !== order.currency)
    return { order, fulfilled: false, reason: 'amount or currency mismatch' };

  // Claim the order atomically so concurrent webhook + browser verification issue ONE licence.
  const { data: claimed } = await db
    .from('orders')
    .update({ status: 'verified', paid_at: new Date().toISOString(), paystack_id: String(tx.id ?? ''), channel: tx.channel ?? null })
    .eq('id', order.id)
    .eq('status', 'awaiting_payment')
    .select('*')
    .maybeSingle();
  if (!claimed) {
    const { data: fresh } = await db.from('orders').select('*').eq('id', order.id).maybeSingle();
    return { order: fresh ?? order, fulfilled: fresh?.status === 'verified' };
  }

  const licenseId = `MTL-${new Date().getFullYear()}-${randomId(5)}-${randomId(4)}`;
  const { error: licErr } = await db.from('licenses').insert({
    id: licenseId,
    order_id: order.id,
    user_id: order.user_id,
    product_id: order.product_id,
    status: 'active'
  });
  if (licErr) throw new Error(`Could not issue licence: ${licErr.message}`);
  const { data: done } = await db.from('orders').update({ license_id: licenseId }).eq('id', order.id).select('*').maybeSingle();
  return { order: done ?? { ...claimed, license_id: licenseId }, fulfilled: true };
}
