import { api } from './accessControl';
import { getSupabase } from './remote';
import { studentsApi } from './students';
import { answer, type AdminSummary, type AssistantAction, type ChatMessage, type Live } from './assistantEngine';
import { site } from '../data/site';
import type { StoreProduct, User } from '../types/store';

export type { AssistantAction, ChatMessage };

/** The built-in assistant needs no server, so it is always available. */
export const assistantAvailable = (): boolean => true;

/* ---- live data, read through the signed-in user's own session (so what it sees is what they could see) ---- */

type PriceRow = { id: string; name?: string; price: number | string; status: 'available' | 'preorder' | 'disabled'; details?: Record<string, unknown> | null };
let priceCache: { at: number; rows: PriceRow[] } | null = null;

const strs = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
const rowsOf = (v: unknown): Array<{ label: string; value: string }> =>
Array.isArray(v) ? v.filter((x) => x && typeof x.label === 'string' && typeof x.value === 'string') : [];
const str = (v: unknown, d = ''): string => typeof v === 'string' ? v : d;

/**
 * The store catalogue the assistant reasons over: this device's products, with live price/status applied,
 * PLUS any product the admin saved on another device (known from the shared price list and its details).
 */
export function mergeCatalog(local: StoreProduct[], rows: PriceRow[]): StoreProduct[] {
  const out = local.map((p) => {
    const r = rows.find((x) => x.id === p.id);
    return r ? { ...p, price: Number(r.price), status: r.status } : p;
  });
  for (const r of rows) {
    if (out.some((p) => p.id === r.id)) continue;
    const d = (r.details ?? {}) as Record<string, unknown>;
    out.push({
      id: r.id,
      slug: str(d.slug, r.id),
      name: str(r.name, r.id),
      category: str(d.category, 'Product'),
      summary: str(d.summary),
      description: str(d.description, str(d.summary)),
      image: '',
      price: Number(r.price),
      currency: 'KES',
      status: r.status,
      features: strs(d.features),
      applications: strs(d.applications),
      specs: rowsOf(d.specs),
      hardware: rowsOf(d.hardware),
      software: rowsOf(d.software),
      architecture: strs(d.architecture)
    });
  }
  return out;
}

async function refreshPrices(): Promise<void> {
  if (priceCache && Date.now() - priceCache.at < 60_000) return;
  const sb = getSupabase();
  if (!sb) return;
  let res = await sb.from('product_prices').select('id,name,price,status,details');
  if (res.error) res = await sb.from('product_prices').select('id,name,price,status'); // details column not added yet
  if (res.data) priceCache = { at: Date.now(), rows: res.data as unknown as PriceRow[] };
}

export function buildLive(user: User | null): Live {
  const isAdmin = user?.role === 'admin';
  return {
    user: user ? { name: user.name, email: user.email, role: user.role } : null,
    prime: refreshPrices,
    catalog: () => mergeCatalog(api.listProducts(true), priceCache?.rows ?? []),
    projects: () => studentsApi.list(),
    myOrders: async () => {
      await api.syncCommerce().catch(() => undefined);
      return api.myOrders();
    },
    myLicenses: async () => api.myLicenses(),
    adminSummary: async (): Promise<AdminSummary | null> => {
      if (!isAdmin) return null; // second lock; the engine also checks the role
      try {
        await api.syncCommerce();
        const orders = api.adminOrders();
        const stats = api.adminStats();
        const paid = orders.filter((o) => o.status === 'verified');
        const by = new Map<string, { name: string; orders: number; revenue: number }>();
        for (const o of paid) {
          const e = by.get(o.productId) ?? { name: o.productName, orders: 0, revenue: 0 };
          e.orders++;
          e.revenue += o.amount;
          by.set(o.productId, e);
        }
        let projects: AdminSummary['projects'] = null;
        try {
          const list = await studentsApi.list();
          projects = { published: list.filter((p) => p.status === 'available').length, draft: list.filter((p) => p.status === 'draft').length };
        } catch {/* marketplace not set up */}
        return {
          customers: await api.adminCustomerCount().catch(() => stats.customers),
          orders: {
            total: orders.length,
            paid: paid.length,
            awaiting: orders.filter((o) => o.status === 'awaiting_payment').length,
            revoked: orders.filter((o) => o.status === 'rejected').length
          },
          revenue: paid.reduce((s, o) => s + o.amount, 0),
          activeLicenses: stats.activeLicenses,
          topProducts: [...by.values()].sort((a, b) => b.revenue - a.revenue),
          recent: orders.slice(0, 8).map((o) => ({
            id: o.id, product: o.productName, amount: o.amount, status: o.status, customer: o.customer?.email ?? 'unknown', date: o.createdAt
          })),
          projects
        };
      } catch {
        return null;
      }
    }
  };
}

/** Answers a question. Never throws; every result is made of validated, in-site actions. */
export async function askAssistant(
messages: ChatMessage[],
user: User | null)
: Promise<{reply: string;actions: AssistantAction[];}> {
  const last = messages[messages.length - 1];
  const res = await answer(last?.content ?? '', messages, buildLive(user));
  return { reply: res.reply, actions: res.actions.filter(isSafeAction) };
}

/* ---- action safety: the browser only ever follows known in-site paths or the official dashboard ---- */

const ROUTES = new Set([
'/', '/store', '/students', '/students/my-projects', '/login', '/register', '/reset-password',
'/portal', '/portal/library', '/portal/orders', '/portal/licenses', '/portal/profile',
'/admin', '/admin/orders', '/admin/products', '/admin/documentation', '/admin/customers', '/admin/students']);

const SLUG = '[a-z0-9][a-z0-9-]{0,80}';
const DYNAMIC = [`^/store/${SLUG}$`, `^/students/${SLUG}$`, `^/students/checkout/${SLUG}$`, `^/checkout/${SLUG}$`].map((r) => new RegExp(r));
const HOME_SECTIONS = new Set(['home', 'about', 'products', 'solutions', 'energy-dashboard', 'contact']);

/** Returns the path when it is a real page of this site, otherwise null. */
export function safePath(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const p = input.trim();
  if (!p || p.length > 120 || !p.startsWith('/') || p.startsWith('//') || /[\\\s:?@]/.test(p)) return null;
  const [path, hash, ...rest] = p.split('#');
  if (rest.length) return null;
  if (hash !== undefined && !(path === '/' && HOME_SECTIONS.has(hash))) return null;
  return ROUTES.has(path) || DYNAMIC.some((r) => r.test(path)) ? p : null;
}

export const isSafeSitePath = (p: unknown): p is string => safePath(p) !== null;

export function isSafeAction(a: AssistantAction): boolean {
  if (a.type === 'navigate') return isSafeSitePath(a.path);
  if (a.type === 'link') return a.href === site.dashboardUrl; // the only external destination allowed
  return false;
}

/* ---- tiny, safe markdown: **bold**, *italic*, `code`, "- " lists, paragraphs. Produces data, never HTML. ---- */
export type Inline = {t: 'text' | 'bold' | 'code' | 'italic';v: string;};
export type Block = {type: 'p';parts: Inline[];} | {type: 'ul';items: Inline[][];};

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: 'text', v: s.slice(last, i) });
    const tok = m[0];
    out.push(tok.startsWith('**') ? { t: 'bold', v: tok.slice(2, -2) } : tok.startsWith('`') ? { t: 'code', v: tok.slice(1, -1) } : { t: 'italic', v: tok.slice(1, -1) });
    last = i + tok.length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let list: Inline[][] | null = null;
  for (const raw of src.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    const bullet = /^[-•]\s+(.*)$/.exec(line) ?? /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!list) {
        list = [];
        blocks.push({ type: 'ul', items: list });
      }
      list.push(parseInline(bullet[1]));
    } else {
      list = null;
      if (line) blocks.push({ type: 'p', parts: parseInline(line) });
    }
  }
  return blocks;
}
