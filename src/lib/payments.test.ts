import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from './accessControl';
import { __setRemoteForTests, type RemoteAuth, type RemoteLicense, type RemoteOrder } from './remote';
import { fulfil, validSignature, type PaystackTx } from '../../supabase/functions/_shared/paystack';

/* ---------- a tiny in-memory stand-in for the supabase client used by fulfil() ---------- */
type Row = Record<string, any>;
function fakeDb(tables: Record<string, Row[]>) {
  const from = (name: string) => {
    const rows = tables[name];
    let filters: Array<[string, unknown]> = [];
    let mode: 'select' | 'update' = 'select';
    let patch: Row = {};
    const matches = () => rows.filter((r) => filters.every(([k, v]) => r[k] === v));
    const q: any = {
      select: () => q,
      eq: (k: string, v: unknown) => (filters.push([k, v]), q),
      update: (p: Row) => ((mode = 'update'), (patch = p), q),
      insert: async (r: Row) => {
        if (name === 'licenses' && rows.some((x) => x.order_id === r.order_id)) return { error: { message: 'duplicate' } };
        rows.push({ ...r });
        return { error: null };
      },
      maybeSingle: async () => {
        const hit = matches()[0];
        if (!hit) return { data: null };
        if (mode === 'update') Object.assign(hit, patch);
        return { data: { ...hit } };
      }
    };
    return q;
  };
  return { from };
}

const order = (over: Row = {}): Row => ({
  id: 'MT-ORD-1', reference: 'MTPAY-1', user_id: 'u1', product_id: 'prd-sem-100',
  amount: 18500, currency: 'KES', status: 'awaiting_payment', license_id: null, ...over
});
const tx = (over: Partial<PaystackTx> = {}): PaystackTx => ({
  status: 'success', reference: 'MTPAY-1', amount: 1850000, currency: 'KES', id: 99, channel: 'mobile_money', ...over
});

describe('paystack fulfilment (server logic)', () => {
  it('issues one licence for a correct successful payment', async () => {
    const t = { orders: [order()], licenses: [] as Row[] };
    const r = await fulfil(fakeDb(t) as any, tx());
    expect(r.fulfilled).toBe(true);
    expect(t.orders[0].status).toBe('verified');
    expect(t.licenses).toHaveLength(1);
    expect(t.orders[0].license_id).toBe(t.licenses[0].id);
    expect(t.licenses[0]).toMatchObject({ user_id: 'u1', product_id: 'prd-sem-100', status: 'active' });
  });

  it('is idempotent: webhook + browser verification never issue two licences', async () => {
    const t = { orders: [order()], licenses: [] as Row[] };
    const db = fakeDb(t) as any;
    await Promise.all([fulfil(db, tx()), fulfil(db, tx())]);
    await fulfil(db, tx());
    expect(t.licenses).toHaveLength(1);
  });

  it('rejects a payment for the wrong amount (cannot underpay)', async () => {
    const t = { orders: [order()], licenses: [] as Row[] };
    const r = await fulfil(fakeDb(t) as any, tx({ amount: 100 }));
    expect(r.fulfilled).toBe(false);
    expect(t.orders[0].status).toBe('awaiting_payment');
    expect(t.licenses).toHaveLength(0);
  });

  it('rejects the wrong currency', async () => {
    const t = { orders: [order()], licenses: [] as Row[] };
    expect((await fulfil(fakeDb(t) as any, tx({ currency: 'USD' }))).fulfilled).toBe(false);
  });

  it('does nothing for failed / abandoned payments and unknown references', async () => {
    const t = { orders: [order()], licenses: [] as Row[] };
    expect((await fulfil(fakeDb(t) as any, tx({ status: 'failed' }))).fulfilled).toBe(false);
    expect((await fulfil(fakeDb(t) as any, tx({ status: 'abandoned' }))).fulfilled).toBe(false);
    expect((await fulfil(fakeDb(t) as any, tx({ reference: 'NOPE' }))).order).toBeNull();
    expect(t.licenses).toHaveLength(0);
  });

  it('does not resurrect a revoked order', async () => {
    const t = { orders: [order({ status: 'rejected' })], licenses: [] as Row[] };
    const r = await fulfil(fakeDb(t) as any, tx());
    expect(r.fulfilled).toBe(false);
    expect(t.licenses).toHaveLength(0);
  });
});

describe('webhook signature', () => {
  it('accepts only the exact HMAC-SHA512 of the body', async () => {
    const body = '{"event":"charge.success"}';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('sk_live_x'), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
    const hex = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
    expect(await validSignature(body, hex, 'sk_live_x')).toBe(true);
    expect(await validSignature(body + ' ', hex, 'sk_live_x')).toBe(false);
    expect(await validSignature(body, hex, 'sk_live_other')).toBe(false);
    expect(await validSignature(body, null, 'sk_live_x')).toBe(false);
    expect(await validSignature(body, 'abc', 'sk_live_x')).toBe(false);
  });
});

/* ---------- client side ---------- */
function fakeRemote(state: {orders: RemoteOrder[];licenses: RemoteLicense[];started: string[];}): RemoteAuth {
  const admin = { id: 'a1', name: 'Admin', email: 'admin@x.com', company: '', phone: '', role: 'admin' as const, disabled: false, createdAt: new Date().toISOString() };
  return {
    commerce: {
      fetchAll: async () => ({ orders: state.orders, licenses: state.licenses, prices: [{ id: 'prd-sem-100', name: 'n', price: 20000, status: 'available' }] }),
      startPayment: async (id) => {
        state.started.push(id);
        return { authorizationUrl: 'https://checkout.paystack.com/abc', order: state.orders[0] };
      },
      verifyPayment: async () => ({ status: 'verified', paystackStatus: 'success', reason: null }),
      savePrice: async () => {}, deletePrice: async () => {},
      revokeOrder: async (id) => { state.orders.find((o) => o.id === id)!.status = 'rejected'; state.licenses.forEach((l) => (l.status = 'deactivated')); },
      setLicenseStatus: async () => {}
    },
    restore: async () => admin,
    signUp: async () => ({ user: admin, needsEmailConfirmation: false }),
    signIn: async () => admin,
    signOut: async () => {},
    requestPasswordReset: async () => {},
    updatePassword: async () => {},
    verifyPassword: async () => true,
    updateProfile: async () => admin,
    listCustomers: async () => [{ ...admin, id: 'u1', role: 'customer', name: 'Jane', email: 'jane@x.com' }],
    setDisabled: async () => {},
    onSignedOut: () => () => {},
    recovery: () => ({ active: false, error: null })
  };
}

describe('client commerce sync', () => {
  const state = { orders: [] as RemoteOrder[], licenses: [] as RemoteLicense[], started: [] as string[] };
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear();
    state.orders = [{ id: 'MT-ORD-1', reference: 'MTPAY-1', user_id: 'u1', product_id: 'prd-sem-100', product_name: 'SEM', amount: '20000.00', currency: 'KES', status: 'verified', created_at: '2026-11-01T10:00:00Z', paid_at: '2026-11-01T10:01:00Z', license_id: 'MTL-1', admin_note: '' }];
    state.licenses = [{ id: 'MTL-1', order_id: 'MT-ORD-1', user_id: 'u1', product_id: 'prd-sem-100', issued_at: '2026-11-01T10:01:00Z', status: 'active' }];
    state.started = [];
    __setRemoteForTests(fakeRemote(state));
  });
  afterEach(() => __setRemoteForTests(undefined));

  it('admin sees every customer order, licence, customer name and the server price', async () => {
    await api.login('admin@x.com', 'whatever-1');
    await api.syncCommerce();
    const rows = api.adminOrders();
    expect(rows).toHaveLength(1);
    expect(rows[0].customer?.name).toBe('Jane');
    expect(rows[0].amount).toBe(20000);
    expect(api.adminLicenses()).toHaveLength(1);
    expect(api.getProduct('smart-energy-meter-sem-100')?.price).toBe(20000);
    expect(api.adminStats().revenue).toBe(20000);
  });

  it('starting a payment returns the Paystack URL and sends only the product id', async () => {
    await api.login('admin@x.com', 'whatever-1');
    const r = await api.startPayment('prd-sem-100');
    expect(r.authorizationUrl).toBe('https://checkout.paystack.com/abc');
    expect(state.started).toEqual(['prd-sem-100']);
  });

  it('admin can revoke but never manually approve a payment', async () => {
    await api.login('admin@x.com', 'whatever-1');
    await api.syncCommerce();
    await expect(api.adminSetOrderStatus('MT-ORD-1', 'verified')).rejects.toThrow(/Paystack/);
    await api.adminSetOrderStatus('MT-ORD-1', 'rejected', 'refunded');
    expect(api.adminOrders()[0].status).toBe('rejected');
    expect(api.adminLicenses()[0].status).toBe('deactivated');
  });

  it('without the shared backend, payments are refused', async () => {
    __setRemoteForTests(null);
    await expect(api.startPayment('prd-sem-100')).rejects.toThrow(/not available/);
  });
});
