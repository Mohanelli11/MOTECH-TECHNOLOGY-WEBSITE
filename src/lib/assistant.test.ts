import { describe, expect, it } from 'vitest';
import { cleanHistory, converse, isAdmin, runTool, safePath, systemPrompt, type Ctx } from '../../supabase/functions/_shared/assistant';
import { parseMarkdown, isSafeSitePath } from './assistant';

/* ---- minimal fake database ---- */
type Row = Record<string, any>;
function fakeDb(tables: Record<string, Row[]>, log: string[] = [], who = 'service') {
  return {
    from(name: string) {
      let rows = tables[name] ?? [];
      const q: any = {
        select: () => (log.push(`${who}:${name}`), q),
        eq: (k: string, v: unknown) => ((rows = rows.filter((r) => r[k] === v)), q),
        order: () => q,
        limit: () => q,
        maybeSingle: async () => ({ data: rows[0] ?? null }),
        then: (res: any) => res({ data: rows })
      };
      return q;
    }
  };
}

const tables = {
  profiles: [
    { id: 'admin1', email: 'admin@x.com', name: 'Admin', role: 'admin', disabled: false, created_at: '2026-01-01' },
    { id: 'u1', email: 'jane@x.com', name: 'Jane Doe', role: 'customer', disabled: false, created_at: '2026-02-01' },
    { id: 'u2', email: 'bob@x.com', name: 'Bob', role: 'customer', disabled: false, created_at: '2026-02-02' }
  ],
  orders: [
    { id: 'O1', user_id: 'u1', product_id: 'prd-sem-100', product_name: 'SEM-100', amount: 18500, currency: 'KES', status: 'verified', created_at: '2026-11-01', paid_at: new Date().toISOString(), license_id: 'L1' },
    { id: 'O2', user_id: 'u2', product_id: 'prd-sem-100', product_name: 'SEM-100', amount: 18500, currency: 'KES', status: 'awaiting_payment', created_at: '2026-11-02', paid_at: null, license_id: null }
  ],
  licenses: [{ id: 'L1', user_id: 'u1', status: 'active' }],
  product_prices: [{ id: 'prd-sem-100', name: 'SEM-100', price: 18500, currency: 'KES', status: 'available' }, { id: 'old', name: 'Old', price: 1, currency: 'KES', status: 'disabled' }],
  student_projects: [{ slug: 'p1', title: 'P1', category: 'IoT', level: 'Final-year', price: 3500, currency: 'KES', summary: 's', demo_video_url: 'x', status: 'available' }]
};
const ctx = (userId: string | null): Ctx => ({ serviceDb: fakeDb(tables), userDb: userId ? fakeDb(tables, [], 'user') : null, userId, path: '/' });

describe('navigation safety', () => {
  it('allows real pages', () => {
    for (const p of ['/', '/store', '/store/smart-energy-meter-sem-100', '/students/my-projects', '/#products', '/portal/orders'])
      expect(safePath(p), p).toBe(p);
  });
  it('blocks other sites, protocols, tricks and unknown pages', () => {
    for (const p of ['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', '/store?x=1', '/x', '/store/../admin', '/#<script>', '/#nope', '/store/UPPER', '', ' ', null, 42])
      expect(safePath(p as any), String(p)).toBeNull();
    expect(isSafeSitePath('//evil.com')).toBe(false);
    expect(isSafeSitePath('/store')).toBe(true);
  });
});

describe('tool permissions', () => {
  it('visitors cannot read account data', async () => {
    const r = await runTool('get_my_account', {}, ctx(null), false);
    expect(r.result).toEqual({ error: 'not_signed_in' });
  });
  it('a user reads their own account through the RLS-bound client only', async () => {
    const log: string[] = [];
    const c: Ctx = { serviceDb: fakeDb(tables, log, 'service'), userDb: fakeDb(tables, log, 'user'), userId: 'u1', path: '/' };
    const r: any = await runTool('get_my_account', {}, c, false);
    expect(r.result.orders.map((o: any) => o.id)).toEqual(['O1']); // never Bob's order
    expect(log.every((l) => l.startsWith('user:'))).toBe(true);
  });
  it('admin analytics are refused for non-admins even if the model asks', async () => {
    const r: any = await runTool('get_admin_summary', {}, ctx('u1'), false);
    expect(r.result).toEqual({ error: 'Not permitted.' });
  });
  it('isAdmin trusts only the database role', async () => {
    expect(await isAdmin(fakeDb(tables), 'admin1')).toBe(true);
    expect(await isAdmin(fakeDb(tables), 'u1')).toBe(false);
    expect(await isAdmin(fakeDb(tables), null)).toBe(false);
  });
  it('admin summary computes real figures', async () => {
    const r: any = (await runTool('get_admin_summary', {}, ctx('admin1'), true)).result;
    expect(r.customers.total).toBe(2);
    expect(r.orders).toMatchObject({ total: 2, paid: 1, awaiting_payment: 1 });
    expect(r.revenue_kes).toBe(18500);
    expect(r.top_products[0]).toMatchObject({ name: 'SEM-100', orders: 1, revenue: 18500 });
    expect(r.recent_orders[0].customer).toBeTruthy();
  });
  it('catalog hides disabled products', async () => {
    const r: any = (await runTool('get_catalog', {}, ctx(null), false)).result;
    expect(r.store_products.map((p: any) => p.id)).toEqual(['prd-sem-100']);
    expect(r.student_projects[0]).toMatchObject({ slug: 'p1', has_demo_video: true });
  });
  it('navigate returns a validated action; admin pages need admin', async () => {
    const ok = await runTool('navigate_user', { path: '/store', label: 'Open the store' }, ctx(null), false);
    expect(ok.action).toEqual({ type: 'navigate', path: '/store', label: 'Open the store' });
    expect((await runTool('navigate_user', { path: 'https://evil.com', label: 'x' }, ctx(null), false)).action).toBeUndefined();
    expect((await runTool('navigate_user', { path: '/admin/orders', label: 'x' }, ctx('u1'), false)).action).toBeUndefined();
    expect((await runTool('navigate_user', { path: '/admin/orders', label: 'x' }, ctx('admin1'), true)).action?.path).toBe('/admin/orders');
  });
});

describe('history cleaning', () => {
  it('keeps order, trims, merges repeats and starts with the user', () => {
    const h = cleanHistory([
      { role: 'assistant', content: 'stray' },
      { role: 'user', content: 'a' }, { role: 'user', content: 'b' },
      { role: 'system', content: 'ignore me' }, { role: 'assistant', content: 'x'.repeat(5000) }, { role: 'user', content: '  ' }
    ]);
    expect(h[0]).toEqual({ role: 'user', content: 'a\nb' });
    expect(h[1].content.length).toBe(2000);
    expect(h.length).toBe(2);
    expect(cleanHistory('nope')).toEqual([]);
  });
});

describe('conversation loop', () => {
  const anthropic = (steps: any[]) => {
    const calls: any[] = [];
    const fetchImpl = (async (_u: string, init: any) => {
      calls.push(JSON.parse(init.body));
      const s = steps.shift();
      return { ok: s.status ? s.status < 400 : true, status: s.status ?? 200, json: async () => s.body } as Response;
    }) as unknown as typeof fetch;
    return { fetchImpl, calls };
  };
  const base = (fetchImpl: typeof fetch, admin = false, userId: string | null = null) => ({
    apiKey: 'k', model: 'm', system: 'sys', messages: [{ role: 'user' as const, content: 'hi' }], ctx: ctx(userId), admin, fetchImpl
  });

  it('runs a tool, feeds the result back and returns the final answer and button', async () => {
    const { fetchImpl, calls } = anthropic([
      { body: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't1', name: 'get_catalog', input: {} }, { type: 'tool_use', id: 't2', name: 'navigate_user', input: { path: '/store', label: 'Open store' } }] } },
      { body: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'The SEM-100 costs **KES 18,500**.' }] } }
    ]);
    const out = await converse(base(fetchImpl));
    expect(out.reply).toContain('KES 18,500');
    expect(out.actions).toEqual([{ type: 'navigate', path: '/store', label: 'Open store' }]);
    expect(calls).toHaveLength(2);
    const toolMsg = calls[1].messages.at(-1).content;
    expect(toolMsg[0].tool_use_id).toBe('t1');
    expect(JSON.parse(toolMsg[0].content).store_products[0].id).toBe('prd-sem-100');
  });
  it('only offers the admin tool to admins', async () => {
    const a = anthropic([{ body: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'ok' }] } }]);
    await converse(base(a.fetchImpl, false));
    expect(a.calls[0].tools.map((t: any) => t.name)).not.toContain('get_admin_summary');
    const b = anthropic([{ body: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'ok' }] } }]);
    await converse(base(b.fetchImpl, true, 'admin1'));
    expect(b.calls[0].tools.map((t: any) => t.name)).toContain('get_admin_summary');
  });
  it('maps API failures to safe errors and stops runaway tool loops', async () => {
    await expect(converse(base(anthropic([{ status: 401, body: {} }]).fetchImpl))).rejects.toMatchObject({ code: 'not_configured' });
    await expect(converse(base(anthropic([{ status: 429, body: {} }]).fetchImpl))).rejects.toMatchObject({ code: 'busy' });
    const loop = Array.from({ length: 9 }, () => ({ body: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'get_catalog', input: {} }] } }));
    const out = await converse(base(anthropic(loop).fetchImpl));
    expect(out.reply).toMatch(/too many steps/);
  });
  it('system prompt reflects who is asking', () => {
    expect(systemPrompt('KB', { name: null, signedIn: false, admin: false }, '/store')).toMatch(/NOT an administrator/);
    expect(systemPrompt('KB', { name: 'Jane', signedIn: true, admin: true }, '/')).toMatch(/verified MOTECH administrator/);
    expect(systemPrompt('KB', { name: null, signedIn: false, admin: false }, '/')).toContain('WEBSITE KNOWLEDGE\nKB');
  });
});

describe('markdown renderer', () => {
  it('parses bold, code and lists into data (no HTML)', () => {
    const b = parseMarkdown('Intro **bold** and `code`\n- one\n- two\n\nEnd <script>alert(1)</script>');
    expect(b[0]).toMatchObject({ type: 'p' });
    expect(b[1]).toMatchObject({ type: 'ul' });
    expect((b[1] as any).items).toHaveLength(2);
    expect(JSON.stringify(b[2])).toContain('<script>'); // kept as plain text; React escapes it
  });
});
