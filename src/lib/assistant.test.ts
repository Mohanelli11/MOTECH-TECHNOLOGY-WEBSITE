import { describe, expect, it } from 'vitest';
import { answer, type AdminSummary, type ChatMessage, type Live } from './assistantEngine';
import { isSafeAction, parseMarkdown, safePath } from './assistant';
import { catalog } from '../data/catalog';
import { site } from '../data/site';

const orders = [
  { id: 'O1', userId: 'u1', productId: 'prd-sem-100', productName: 'Smart Energy Meter SEM-100', amount: 18500, currency: 'KES', status: 'verified', createdAt: '2026-11-01', reviewedAt: null, adminNote: '', licenseId: 'L1', reference: 'R' },
  { id: 'O2', userId: 'u1', productId: 'prd-sem-100', productName: 'Smart Energy Meter SEM-100', amount: 18500, currency: 'KES', status: 'awaiting_payment', createdAt: '2026-11-02', reviewedAt: null, adminNote: '', licenseId: null, reference: 'R2' }
] as any[];
const summary: AdminSummary = {
  customers: 12, orders: { total: 20, paid: 8, awaiting: 11, revoked: 1 }, revenue: 148000, activeLicenses: 7,
  topProducts: [{ name: 'Smart Energy Meter SEM-100', orders: 6, revenue: 111000 }],
  recent: [{ id: 'O9', product: 'SEM-100', amount: 18500, status: 'verified', customer: 'jane@x.com', date: '2026-11-03' }],
  projects: { published: 3, draft: 1 }
};
const live = (role: 'customer' | 'admin' | null, extra: Partial<Live> = {}): Live => ({
  user: role ? { name: 'Jane Doe', email: 'jane@x.com', role } : null,
  catalog: () => catalog.map((c) => (c.id === 'prd-sem-100' ? { ...c, price: 20000 } : c)), // live price differs from the static one
  projects: async () => [{ id: 'prj-1', slug: 'p1', title: 'Solar Tracker', summary: '', description: '', category: 'IoT', level: 'Final-year', price: 3500, currency: 'KES', status: 'available', imageUrl: '', tags: [], includes: [], filePath: 'x', demoVideoUrl: 'v', demoVideoPath: 'v', demoDuration: 90, createdAt: '' }, { id: 'prj-2', slug: 'p2', title: 'Hidden Draft', summary: '', description: '', category: 'IoT', level: 'x', price: 1, currency: 'KES', status: 'draft', imageUrl: '', tags: [], includes: [], filePath: null, demoVideoUrl: '', demoVideoPath: null, demoDuration: null, createdAt: '' }],
  myOrders: async () => orders,
  myLicenses: async () => [{ id: 'L1', orderId: 'O1', userId: 'u1', productId: 'prd-sem-100', issuedAt: '', status: 'active' }],
  adminSummary: async () => summary,
  ...extra
});
const ask = async (q: string, who: 'customer' | 'admin' | null = null, history: ChatMessage[] = []) =>
  answer(q, [...history, { role: 'user', content: q }], live(who));

describe('products', () => {
  it('quotes the LIVE price, not the static one', async () => {
    const r = await ask('How much is the SEM-100?');
    expect(r.reply).toContain('KES 20,000');
    expect(r.actions.map((a) => a.type === 'navigate' && a.path)).toContain('/store/smart-energy-meter-sem-100');
  });
  it('finds products by common wording', async () => {
    expect((await ask('price of the smart breathalyzer')).reply).toMatch(/BRZ-200/);
    expect((await ask('do you have a data logger for power quality')).reply).toMatch(/PQL-300/);
    expect((await ask('tell me about roamfi')).reply).toMatch(/ROAMfi/);
    expect((await ask('what does the prepaid meter cost')).reply).toMatch(/SEM-100/);
  });
  it('returns specifications and hardware', async () => {
    const s = (await ask('SEM-100 technical specifications')).reply;
    expect(s).toMatch(/Rated voltage/);
    expect(s).toMatch(/IEC 62053-21/);
    expect((await ask('what MCU and modem does the SEM-100 use')).reply).toMatch(/Cortex-M4/);
  });
  it('remembers the product from the previous turn', async () => {
    const h: ChatMessage[] = [{ role: 'user', content: 'Tell me about the breathalyzer' }, { role: 'assistant', content: 'The Smart Breathalyzer BRZ-200 ...' }];
    const r = await ask('and how much does it cost?', null, h);
    expect(r.reply).toMatch(/BRZ-200/);
    expect(r.reply).toMatch(/KES/);
  });
  it('compares two products', async () => {
    const r = await ask('compare the SEM-100 and the PQL-300');
    expect(r.reply).toMatch(/SEM-100/);
    expect(r.reply).toMatch(/PQL-300/);
  });
  it('lists the catalogue with live prices', async () => {
    const r = await ask('what products do you sell?');
    expect(r.reply).toContain('KES 20,000');
    expect(r.reply).toMatch(/ROAMfi/);
  });
});

describe('permissions', () => {
  it('visitors and customers never get business analytics', async () => {
    for (const who of [null, 'customer'] as const) {
      const r = await ask('what is the total revenue and how many customers do we have?', who);
      expect(r.reply).toMatch(/administrators only/);
      expect(r.reply).not.toContain('148,000');
    }
  });
  it('the admin gets real analytics', async () => {
    const r = await ask('give me a sales summary', 'admin');
    expect(r.reply).toContain('KES 148,000');
    expect(r.reply).toMatch(/12/);
    expect(r.reply).toMatch(/jane@x.com/);
  });
  it('admin pages are refused for non-admins and offered to admins', async () => {
    expect((await ask('take me to the admin orders page', 'customer')).actions.some((a) => a.type === 'navigate' && a.path.startsWith('/admin'))).toBe(false);
    expect((await ask('take me to the admin orders page', 'admin')).actions[0]).toMatchObject({ path: '/admin/orders' });
  });
  it('account questions need sign-in, then show only the user’s own data', async () => {
    expect((await ask('did my payment go through?')).reply).toMatch(/sign in/i);
    const r = await ask('did my payment go through?', 'customer');
    expect(r.reply).toMatch(/paid/);
    expect(r.reply).toMatch(/awaiting payment/);
    expect(r.reply).toContain('1** active licence');
  });
  it('does not mistake "prepaid" for "paid"', async () => {
    const r = await ask('how does prepaid metering work?');
    expect(r.reply).toMatch(/token/i);
    expect(r.reply).not.toMatch(/administrators only/);
  });
});

describe('navigation and how-to', () => {
  it('takes people to pages', async () => {
    expect((await ask('take me to the store')).actions[0]).toMatchObject({ path: '/store' });
    expect((await ask('open my licences', 'customer')).actions[0]).toMatchObject({ path: '/portal/licenses' });
    expect((await ask('go to my projects', 'customer')).actions[0]).toMatchObject({ path: '/students/my-projects' });
    expect((await ask('take me to the energy dashboard')).actions[0]).toMatchObject({ type: 'link', href: site.dashboardUrl });
  });
  it('explains buying, accounts and the marketplace', async () => {
    expect((await ask('how do I buy a meter?')).reply).toMatch(/Paystack/);
    expect((await ask('I forgot my password')).reply).toMatch(/Forgot password/);
    expect((await ask('how does the students marketplace work')).reply).toMatch(/My Projects/);
    expect((await ask('I want a refund')).reply).toContain(site.email);
  });
  it('lists only PUBLISHED student projects', async () => {
    const r = await ask('which student projects are available?');
    expect(r.reply).toMatch(/Solar Tracker/);
    expect(r.reply).not.toMatch(/Hidden Draft/);
  });
  it('degrades gracefully when live data fails', async () => {
    const r = await answer('which student projects are available?', [], live(null, { projects: async () => { throw new Error('offline'); } }));
    expect(r.reply).toMatch(/No student projects/);
  });
});

describe('technical knowledge and fallback', () => {
  it('answers engineering concepts', async () => {
    expect((await ask('what is harmonic distortion and THD?')).reply).toMatch(/power quality/i);
    expect((await ask('what does class 1 accuracy mean')).reply).toMatch(/±1 %/);
    expect((await ask('explain LTE Cat-M1')).reply).toMatch(/low-power/);
  });
  it('is honest when it does not know, and gives contact details', async () => {
    const r = await ask('what is the capital of France');
    expect(r.reply).toMatch(/not certain/);
    expect(r.reply).toContain(site.phone);
  });
  it('greets and handles empty input', async () => {
    expect((await ask('hello')).reply).toMatch(/Hello, Jane|Hello\./);
    expect((await ask('   ')).reply).toMatch(/type a question/);
  });
});

describe('action safety', () => {
  it('only allows real pages and the official dashboard', () => {
    expect(safePath('/store/smart-energy-meter-sem-100')).toBeTruthy();
    for (const p of ['https://evil.com', '//evil.com', 'javascript:alert(1)', '/store?x=1', '/nope', '/#bad', '/store/../admin'])
      expect(safePath(p), p).toBeNull();
    expect(isSafeAction({ type: 'link', href: site.dashboardUrl, label: 'x' })).toBe(true);
    expect(isSafeAction({ type: 'link', href: 'https://evil.com', label: 'x' })).toBe(false);
    expect(isSafeAction({ type: 'navigate', path: '//evil.com', label: 'x' })).toBe(false);
  });
  it('every action the engine can emit is safe', async () => {
    const qs = ['what products do you sell', 'SEM-100 price', 'students marketplace', 'how to buy', 'my orders', 'forgot password', 'contact', 'about', 'dashboard', 'compare SEM-100 and BRZ-200', 'sales summary', 'take me to the store'];
    for (const who of [null, 'customer', 'admin'] as const)
      for (const q of qs) for (const a of (await ask(q, who)).actions) expect(isSafeAction(a), `${q} -> ${JSON.stringify(a)}`).toBe(true);
  });
});

describe('markdown renderer', () => {
  it('produces data, and keeps markup as inert text', () => {
    const b = parseMarkdown('A **bold** and *italic* and `code`\n- one\n- two\n\n<script>alert(1)</script>');
    expect(b[1]).toMatchObject({ type: 'ul' });
    expect(JSON.stringify(b[2])).toContain('<script>');
  });
});
