/**
 * MOTECH site assistant — built-in rules engine. Free, instant, no API key, no server.
 * It answers from the website's own data (products, store catalogue, site info) plus LIVE data read
 * through the signed-in user's own session (prices, student projects, the user's orders; and for the
 * administrator only, business analytics). Everything it can see, the user could already see.
 */
import { catalog } from '../data/catalog';
import { products as homeProducts } from '../data/products';
import { coreAreas, industries, site, whyChoose } from '../data/site';
import type { Order, License, StoreProduct } from '../types/store';
import type { Project } from './students';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type AssistantAction =
{type: 'navigate';path: string;label: string;} |
{type: 'link';href: string;label: string;};

export type AdminSummary = {
  customers: number;
  orders: { paid: number; awaiting: number; revoked: number; total: number };
  revenue: number;
  activeLicenses: number;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  recent: Array<{ id: string; product: string; amount: number; status: string; customer: string; date: string }>;
  projects: { published: number; draft: number } | null;
};

/** Everything the engine may read. Injected so it can be tested and so permissions stay explicit. */
export type Live = {
  user: { name: string; email: string; role: 'customer' | 'admin' } | null;
  catalog: () => StoreProduct[];
  projects: () => Promise<Project[]>;
  myOrders: () => Promise<Order[]>;
  myLicenses: () => Promise<License[]>;
  adminSummary: () => Promise<AdminSummary | null>;
  /** Optional: refresh live data (e.g. current prices) before answering. */
  prime?: () => Promise<void>;
};

type Answer = { reply: string; actions: AssistantAction[] };

const kes = (n: number) => `KES ${n.toLocaleString('en-KE')}`;
const nav = (path: string, label: string): AssistantAction => ({ type: 'navigate', path, label });
const A = (reply: string, ...actions: AssistantAction[]): Answer => ({ reply, actions });

/* ------------------------------------------------------------------ text helpers */

const norm = (s: string) =>
s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9+\-\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Word-start match so "paid" never matches "prepaid". Accepts regex fragments. */
const has = (n: string, ...words: string[]) => words.some((w) => new RegExp(`(^|[^a-z0-9])${w}`).test(n));

const STOP = new Set('the a an of and or to in on for with is are do does can i you me my it its this that what how which about tell give show please'.split(' '));
const tokens = (s: string) => norm(s).split(' ').filter((t) => t && !STOP.has(t));

/* ------------------------------------------------------------------ product entities */

type Entity = {
  key: string;
  name: string;
  store?: StoreProduct;
  homeIdx?: number;
  tokens: Set<string>;
};

const HOME_TO_STORE: Record<number, string> = { 0: 'prd-sem-100', 1: 'prd-brz-200', 2: 'prd-pql-300', 3: 'prd-rmf-400' };

/** Builds the products the assistant can talk about: the built-in ones plus anything the admin has added. */
function buildEntities(products: StoreProduct[]): Entity[] {
  const list: Entity[] = [];
  const used = new Set<string>();
  const current = (id: string) => products.find((p) => p.id === id) ?? catalog.find((c) => c.id === id);
  homeProducts.forEach((h, i) => {
    const st = current(HOME_TO_STORE[i]);
    if (st) used.add(st.id);
    list.push({
      key: st?.id ?? h.id,
      name: st ? st.name : h.name,
      store: st,
      homeIdx: i,
      tokens: new Set([...tokens(h.name), ...(st ? tokens(st.name + ' ' + st.slug.replace(/-/g, ' ')) : [])])
    });
  });
  // every other store product, built-in or admin-added (new products appear here automatically)
  const all = [...catalog.map((c) => current(c.id)!), ...products.filter((p) => !catalog.some((c) => c.id === p.id))];
  for (const c of all)
  if (c && !used.has(c.id) && c.status !== 'disabled')
  list.push({ key: c.id, name: c.name, store: c, tokens: new Set(tokens(c.name + ' ' + c.slug.replace(/-/g, ' '))) });
  // aliases that people actually type
  const alias: Record<string, string[]> = {
    'prd-sem-100': ['sem', 'sem100', 'meter', 'meters', 'metering', 'prepaid', 'postpaid'],
    'prd-brz-200': ['brz', 'brz200', 'breathalyser', 'breathalyzer', 'alcohol'],
    'prd-pql-300': ['pql', 'pql300', 'logger', 'datalogger', 'pq'],
    'prd-rmf-400': ['roamfi', 'router', 'rmf'],
    'prd-doc-sem': ['metering package'],
    'prd-doc-pq': ['audit', 'toolkit']
  };
  for (const e of list) for (const a of alias[e.key] ?? []) tokens(a).forEach((t) => e.tokens.add(t));
  return list;
}

const GENERIC = new Set(['smart', 'energy', 'system', 'data', 'power', 'quality', 'secure', 'node', 'engineering', 'package', 'phase', '1', '3', '1-phase', '3-phase']);

function findEntities(text: string, ENTITIES: Entity[]): Entity[] {
  const t = new Set(tokens(text));
  const compact = norm(text).replace(/[\s-]/g, '');
  const scored: Array<[Entity, number]> = [];
  for (const e of ENTITIES) {
    let s = 0;
    for (const tok of e.tokens) {
      const hit = t.has(tok) || tok.length > 3 && compact.includes(tok.replace(/-/g, ''));
      if (hit) s += GENERIC.has(tok) ? 0.4 : 1.2;
    }
    if (s >= 1) scored.push([e, s]);
  }
  return scored.sort((a, b) => b[1] - a[1]).map(([e]) => e);
}

/* ------------------------------------------------------------------ static technical knowledge */

const GLOSSARY: Array<{ re: RegExp; title: string; text: string }> = [
{
  re: /prepaid|token|vend/,
  title: 'Prepaid token metering',
  text:
  'In prepaid metering the customer buys energy credit first. A vending system issues a token (a numeric code or a remote credit command); the meter validates it, adds the purchased kWh to its billing register, and decrements the balance as energy is consumed. When credit runs low the meter alerts the user, and at zero it can open its disconnect relay until the next top-up. Postpaid metering instead logs consumption and bills afterwards. MOTECH’s meters support both models, with token-based vending and remote disconnect/reconnect.'
},
{
  re: /smart (energy )?meter|ami\b|advanced metering/,
  title: 'Smart metering',
  text:
  'A smart meter measures voltage and current at high sampling rates, computes active/reactive energy in a metrology front end, logs it at fixed intervals, and reports to a cloud platform over GSM/LTE or WiFi. Benefits over conventional meters are remote reading, time-stamped load profiles, tamper and reverse-flow detection, remote disconnect/reconnect, and over-the-air firmware updates.'
},
{
  re: /accuracy|class 1|62053|iec/,
  title: 'Accuracy class',
  text:
  'Class 1 active-energy accuracy under IEC 62053-21 means the permitted measurement error is within ±1 % across the specified current range at reference conditions. It is the standard class for commercial and residential revenue metering of active energy.'
},
{
  re: /lte|cat-?m1|gsm|2g|cellular|backhaul|connectivity/,
  title: 'Cellular connectivity',
  text:
  'LTE Cat-M1 is a low-power wide-area cellular standard for IoT: low data rates, deep indoor coverage and long battery or low-standby-power operation. A 2G fallback keeps devices reporting where LTE-M coverage is limited. GSM/LTE backhaul lets meters and loggers report to the cloud without local network infrastructure.'
},
{
  re: /power quality|harmonic|thd|sag|swell|flicker|transient|voltage dip/,
  title: 'Power quality monitoring',
  text:
  'Power quality describes how closely supply voltage and current match an ideal sinusoid at the nominal level. Typical issues are harmonics (measured as THD), voltage sags and swells, transients, flicker, imbalance and frequency deviation. They cause overheating, nuisance trips, motor and transformer stress and equipment malfunction. Data loggers such as the PQL-300 record these events continuously so an engineer can trace causes and size mitigation (filters, UPS, correction).'
},
{
  re: /\bct\b|current transformer|shunt/,
  title: 'Current sensing',
  text:
  'Energy meters sense current with a shunt resistor (direct-connect, low cost, no isolation) or a current transformer, CT (galvanic isolation, suited to higher currents). The analogue front end digitises voltage and current, and the metrology engine computes RMS values, active/reactive power and energy.'
},
{
  re: /rtos|firmware|ota|over.the.air|mcu|cortex|embedded/,
  title: 'Embedded firmware',
  text:
  'MOTECH designs hardware and firmware in-house: ARM Cortex-class MCUs, RTOS-based task scheduling, low-power design, secure boot/encrypted transport and over-the-air (OTA) firmware updates so deployed devices can be patched without site visits.'
},
{
  re: /tamper|reverse.flow|magnetic|theft/,
  title: 'Tamper and theft detection',
  text:
  'Smart meters detect tampering through cover-open and magnetic-field sensing, reverse-flow detection, and abnormal load/neutral conditions. Events are time-stamped and reported to the cloud dashboard as alerts so utilities and landlords can respond quickly.'
},
{
  re: /fuel.cell|electrochemical|breath|alcohol|bac\b/,
  title: 'Breath alcohol sensing',
  text:
  'Electrochemical fuel-cell sensors oxidise alcohol in a breath sample and produce a current proportional to concentration, giving better selectivity and stability than semiconductor sensors. Integrated with access control and cloud reporting, a breathalyzer system can allow or deny entry automatically and keep an audit log.'
},
{
  re: /iot|internet of things/,
  title: 'Internet of Things',
  text:
  'IoT systems connect sensing devices to cloud analytics. MOTECH’s approach is device → secure transport (encrypted, authenticated) → cloud platform → dashboards, alerts and billing logic.'
}];


/* ------------------------------------------------------------------ pages for navigation */

type Page = { re: RegExp; path: string; label: string; admin?: boolean };
const PAGES: Page[] = [
{ re: /admin.*(order|payment|sales)|manage orders/, path: '/admin/orders', label: 'Open admin orders', admin: true },
{ re: /admin.*(product|price|catalog)|manage products/, path: '/admin/products', label: 'Open admin products', admin: true },
{ re: /admin.*(customer|user)|manage customers/, path: '/admin/customers', label: 'Open customers', admin: true },
{ re: /admin.*(student|project)|manage (student|project)/, path: '/admin/students', label: 'Open student projects admin', admin: true },
{ re: /admin.*(doc|file)/, path: '/admin/documentation', label: 'Open admin documentation', admin: true },
{ re: /admin/, path: '/admin', label: 'Open admin overview', admin: true },
{ re: /my.*(student )?projects?|purchased projects?/, path: '/students/my-projects', label: 'Open My Projects' },
{ re: /student|marketplace|engineering projects?/, path: '/students', label: 'Open the students marketplace' },
{ re: /my orders?|payment history|order history|orders?\b/, path: '/portal/orders', label: 'Open my orders' },
{ re: /licen[cs]es?/, path: '/portal/licenses', label: 'Open my licences' },
{ re: /library|documentation|docs\b|downloads?|manuals?|datasheets?/, path: '/portal/library', label: 'Open my library' },
{ re: /profile|account (settings|details)|change (my )?password/, path: '/portal/profile', label: 'Open my profile' },
{ re: /sign ?in|log ?in/, path: '/login', label: 'Go to sign in' },
{ re: /register|sign ?up|create (an |my |a )?account/, path: '/register', label: 'Create an account' },
{ re: /store|shop|buy|catalog/, path: '/store', label: 'Open the store' },
{ re: /contact|reach|support/, path: '/#contact', label: 'Go to the contact section' },
{ re: /about|company|who are you/, path: '/#about', label: 'Go to About' },
{ re: /solutions?/, path: '/#solutions', label: 'Go to Solutions' },
{ re: /home\s?(page)?$|main page|^home/, path: '/', label: 'Go to the home page' },
{ re: /products?/, path: '/#products', label: 'Go to Products' }];


/* ------------------------------------------------------------------ the engine */

const CONTACT = `Email **${site.email}** or phone/WhatsApp **${site.phone}**.`;

function productCard(e: Entity, priceLine: string): string {
  const s = e.store;
  const h = e.homeIdx !== undefined ? homeProducts[e.homeIdx] : undefined;
  const desc = s?.description ?? h?.description ?? '';
  return `**${e.name}**${s ? ` (${s.category})` : ''}\n${desc}${priceLine}`;
}

function priceOf(e: Entity, live: Live): string {
  if (!e.store) return '';
  const p = live.catalog().find((c) => c.id === e.store!.id) ?? e.store;
  if (p.status === 'disabled') return `\n\n**Availability:** currently unavailable.`;
  return `\n\n**Price:** ${kes(p.price)} (excl. VAT)${p.status === 'preorder' ? ' — pre-order' : ''}.`;
}

function rows(r: Array<{ label: string; value: string }> | undefined) {
  return (r ?? []).map((x) => `- **${x.label}:** ${x.value}`).join('\n');
}

function howToBuy(extra: AssistantAction[] = []): Answer {
  return A('**How to buy**\n1. Create an account (or sign in)\n2. Open the product in the store and choose **Buy now**\n3. Review the order and press **Pay with Paystack**; pay by card or M-Pesa (KES)\n4. When Paystack confirms the payment, your licence is issued automatically and documentation or downloads unlock in **My Library**\n\nThe price is always set by our server at checkout. MOTECH never sees your card details.',
  ...extra, nav('/store', 'Open the store'), nav('/portal/orders', 'My orders'));
}

function lastEntity(history: ChatMessage[], entities: Entity[]): Entity | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = findEntities(history[i].content, entities)[0];
    if (m) return m;
  }
  return undefined;
}

export async function answer(question: string, history: ChatMessage[], live: Live): Promise<Answer> {
  const q = norm(question);
  const prior = history.slice(0, -1);
  const admin = live.user?.role === 'admin';
  try {
    await live.prime?.();
  } catch {/* offline: static data still answers */}

  if (!q) return A('Please type a question, for example “What does the SEM-100 cost?”.');

  /* 1. greetings and meta */
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|greetings|howdy)\b/.test(q) && q.split(' ').length <= 4)
  return A(`Hello${live.user ? `, ${live.user.name.split(' ')[0]}` : ''}. I’m the MOTECH assistant. I can explain our products and specifications, quote live prices, guide you through buying and downloads, check your orders${admin ? ', and analyse sales and customers' : ''}, and take you to the right page. What would you like to know?`);
  if (/^(thanks|thank you|asante|cheers|great|ok(ay)?|cool)\b/.test(q) && q.split(' ').length <= 5)
  return A('You’re welcome. Ask me anything else about MOTECH’s products, the store or the students marketplace.');
  if (has(q, 'what can you', 'help me', 'what do you do', 'who are you', 'how (can|do) you help'))
  return A(
    `I answer from this website’s own information. I can:\n- Explain products, specifications, features and applications\n- Give live prices and availability\n- Explain how to buy, pay (Paystack: card or M-Pesa) and download\n- Show your orders, payment status and licences (when signed in)\n- Describe the Engineering Students marketplace and its projects\n- Explain metering, power-quality and IoT concepts\n- Navigate you to any page${admin ? '\n- Summarise sales, revenue, customers and orders (admin)' : ''}`,
    nav('/store', 'Open the store')
  );

  /* 2. navigation requests */
  if (has(q, 'take me', 'go to', 'open', 'navigate', 'where (is|can|do) (i|the)', 'link to', 'show me the page', 'bring me', 'direct me')) {
    const target = PAGES.find((p) => p.re.test(q));
    if (target) {
      if (target.admin && !admin) return A('That page is for MOTECH administrators only. I can take you to the store or your account pages instead.', nav('/store', 'Open the store'));
      return A(`Here you go.`, nav(target.path, target.label));
    }
    if (has(q, 'energy dashboard', 'dashboard'))
    return A('The Energy Management Dashboard is a separate web app for smart-meter monitoring, billing and analytics.', { type: 'link', href: site.dashboardUrl, label: 'Open the Energy Dashboard' });
  }

  /* 3. administrator analytics */
  const adminTopic = has(q, 'revenue', 'sales', 'earned', 'income', 'turnover', 'how many customers', 'total customers', 'number of customers', 'pending orders', 'unpaid', 'awaiting payment', 'best sell', 'top product', 'top selling', 'recent orders', 'latest orders', 'business (summary|overview|analytics|report)', 'analytics', 'all orders', 'orders summary', 'how many orders', 'active licen');
  if (adminTopic) {
    if (!admin)
    return A('Sales, revenue and customer analytics are available to MOTECH administrators only. I can help with product information, your own orders and how to buy.', nav('/store', 'Open the store'));
    const s = await live.adminSummary();
    if (!s) return A('I could not load the business data right now. Please try again, or open the admin overview.', nav('/admin', 'Open admin overview'));
    const top = s.topProducts.slice(0, 3).map((t) => `- **${t.name}** — ${t.orders} order${t.orders === 1 ? '' : 's'}, ${kes(t.revenue)}`).join('\n') || '- No paid orders yet.';
    const recent = s.recent.slice(0, 5).map((o) => `- ${o.id}: ${o.product}, ${kes(o.amount)}, **${o.status === 'verified' ? 'paid' : o.status === 'awaiting_payment' ? 'awaiting payment' : 'revoked'}** (${o.customer})`).join('\n');
    const avg = s.orders.paid ? Math.round(s.revenue / s.orders.paid) : 0;
    const conv = s.orders.total ? Math.round(s.orders.paid / s.orders.total * 100) : 0;
    let body = `**Business summary (all amounts in KES)**\n- **Revenue (paid orders):** ${kes(s.revenue)}\n- **Orders:** ${s.orders.total} total — ${s.orders.paid} paid, ${s.orders.awaiting} awaiting payment, ${s.orders.revoked} revoked\n- **Customers:** ${s.customers}\n- **Active licences:** ${s.activeLicenses}`;
    if (s.projects) body += `\n- **Student projects:** ${s.projects.published} published, ${s.projects.draft} draft`;
    body += `\n\n**Indicators:** average paid order ${kes(avg)}; checkout completion ${conv}% (paid ÷ created).\n\n**Top products**\n${top}`;
    if (recent) body += `\n\n**Most recent orders**\n${recent}`;
    if (s.orders.awaiting > 0) body += `\n\nNote: ${s.orders.awaiting} order${s.orders.awaiting === 1 ? ' is' : 's are'} unpaid; these are checkouts customers started but did not complete on Paystack.`;
    return A(body, nav('/admin/orders', 'Open admin orders'), nav('/admin/customers', 'Open customers'));
  }

  /* 4. the signed-in user's own account */
  if (has(q, 'my (order|payment|licen|download|purchase|invoice|project)', 'did (my|the) payment', 'order status', 'payment status', 'have i (paid|bought|purchased)', 'what (did|have) i (buy|bought|order)', 'where are my')) {
    if (!live.user)
    return A('Please sign in first and I can show your orders, payment status and licences.', nav('/login', 'Sign in'), nav('/register', 'Create an account'));
    const [orders, lics] = await Promise.all([live.myOrders(), live.myLicenses()]);
    if (orders.length === 0)
    return A('You have no orders yet. Browse the store or the students marketplace to get started.', nav('/store', 'Open the store'), nav('/students', 'Students marketplace'));
    const label = (o: Order) => o.status === 'verified' ? '**paid**' : o.status === 'awaiting_payment' ? '**awaiting payment**' : '**revoked**';
    const list = orders.slice(0, 6).map((o) => `- ${o.productName} — ${kes(o.amount)}, ${label(o)} (${o.id})`).join('\n');
    const active = lics.filter((l) => l.status === 'active').length;
    let note = '';
    if (orders.some((o) => o.status === 'awaiting_payment'))
    note += '\n\nAn order marked *awaiting payment* means the Paystack payment was not completed. If you were charged, it normally confirms within a few minutes; if it does not, contact us with the order number.';
    return A(`**Your orders**\n${list}\n\nYou hold **${active}** active licence${active === 1 ? '' : 's'}.${note}`,
    nav('/portal/orders', 'Open my orders'), nav('/portal/library', 'Open my library'), nav('/students/my-projects', 'My projects'));
  }

  /* 5. specific products */
  const entities = buildEntities(live.catalog());
  const ents = findEntities(question, entities);
  const wantsPrice = has(q, 'price', 'cost', 'how much', 'kes', 'ksh', 'pricing', 'afford', 'expensive', 'cheap', 'quote');
  const wantsSpecs = has(q, 'spec', 'technical', 'rated', 'voltage', 'current', 'accuracy', 'enclosure', 'ip5', 'sampling', 'datasheet', 'dimension', 'power supply');
  const wantsFeatures = has(q, 'feature', 'capabilit', 'functions?', 'what can (it|the)', 'benefit');
  const wantsApps = has(q, 'application', 'use case', 'used for', 'suitable', 'where (can|is) (it|the).*used', 'who (is|are) (it|this) for');
  const wantsHardware = has(q, 'hardware', 'mcu', 'processor', 'modem', 'memory', 'display', 'sensor', 'architecture', 'firmware', 'software', 'protocol', 'built', 'cloud');
  const wantsCompare = has(q, 'compare', 'difference', ' vs ', 'versus', 'which (one|is better)');
  const attr = wantsPrice || wantsSpecs || wantsFeatures || wantsApps || wantsHardware;

  if (wantsCompare && ents.length >= 2) {
    const [a, b] = ents;
    const line = (e: Entity) => `**${e.name}** — ${e.store?.summary ?? homeProducts[e.homeIdx ?? 0]?.tagline}. ${e.store ? `Price ${kes((live.catalog().find((c) => c.id === e.store!.id) ?? e.store).price)}. ` : ''}Key features: ${(e.store?.features ?? homeProducts[e.homeIdx ?? 0]?.features ?? []).slice(0, 4).join('; ')}.`;
    return A(`${line(a)}\n\n${line(b)}\n\nThey serve different needs; tell me your application and I will recommend one.`,
    ...[a, b].filter((e) => e.store).map((e) => nav(`/store/${e.store!.slug}`, `View ${e.name}`)));
  }

  if (!attr && !wantsCompare && has(q, 'how (do|can|should) (i|we) (buy|order|purchase|pay|get)', 'where (can|do) i (buy|get|order)', 'want to (buy|order|purchase)', 'ready to (buy|order)')) {
    const e = ents[0];
    return howToBuy(e?.store ? [nav(`/checkout/${e.store.slug}`, `Buy ${e.name}`)] : []);
  }

  const ent = ents[0] ?? (attr ? lastEntity(prior, entities) : undefined);
  if (ent) {
    const s = ent.store;
    const h = ent.homeIdx !== undefined ? homeProducts[ent.homeIdx] : undefined;
    const acts: AssistantAction[] = s ? [nav(`/store/${s.slug}`, `View ${ent.name}`)] : [];
    if (s && s.status !== 'disabled') acts.push(nav(`/checkout/${s.slug}`, 'Buy now'));
    if (ent.key === 'prd-sem-100') acts.push({ type: 'link', href: site.dashboardUrl, label: 'Energy Dashboard' });
    if (wantsPrice && !wantsSpecs && !wantsFeatures && !wantsHardware) {
      if (!s) return A(`**${ent.name}** is quoted on request. ${CONTACT}`, ...acts);
      const p = live.catalog().find((c) => c.id === s.id) ?? s;
      if (p.status === 'disabled') return A(`**${ent.name}** is currently unavailable. ${CONTACT}`, ...acts);
      return A(`**${ent.name}** costs **${kes(p.price)}** (excl. VAT)${p.status === 'preorder' ? ', available for pre-order' : ''}.\n\nPayment is by Paystack (card or M-Pesa). A licence and the protected documentation unlock automatically once payment is confirmed. For bulk or utility-scale pricing, contact MOTECH: ${CONTACT}`, ...acts);
    }
    if (wantsSpecs && s?.specs.length)
    return A(`**${ent.name} — specifications**\n${rows(s.specs)}${s.hardware.length ? `\n\n**Hardware**\n${rows(s.hardware)}` : ''}`, ...acts);
    if (wantsHardware && s && (s.hardware.length || s.software.length || s.architecture.length))
    return A(`**${ent.name} — hardware, software & architecture**${s.hardware.length ? `\n\n**Hardware**\n${rows(s.hardware)}` : ''}${s.software.length ? `\n\n**Software**\n${rows(s.software)}` : ''}${s.architecture.length ? `\n\n**Architecture**\n${s.architecture.map((x) => `- ${x}`).join('\n')}` : ''}`, ...acts);
    if (wantsFeatures)
    return A(`**${ent.name} — key features**\n${(s?.features ?? h?.features ?? []).map((f) => `- ${f}`).join('\n')}`, ...acts);
    if (wantsApps)
    return A(`**${ent.name} — typical applications**\n${(s?.applications ?? h?.applications ?? []).map((f) => `- ${f}`).join('\n')}`, ...acts);
    const feats = (s?.features ?? h?.features ?? []).slice(0, 5).map((f) => `- ${f}`).join('\n');
    return A(`${productCard(ent, priceOf(ent, live))}\n\n**Highlights**\n${feats}\n\nAsk me about its specifications, hardware, applications or price.`, ...acts);
  }

  /* 6. students marketplace */
  if (has(q, 'student', 'marketplace', 'final.?year', 'engineering projects?', 'demo video', 'project files', 'capstone', 'thesis')) {
    const wantsList = has(q, 'list', 'available', 'what projects', 'which projects', 'show', 'browse', 'price', 'cost', 'how much', 'catalog');
    if (wantsList) {
      let projects: Project[] = [];
      try {
        projects = (await live.projects()).filter((p) => p.status === 'available');
      } catch {/* offline */}
      if (projects.length === 0) return A('No student projects are published yet. New projects are added regularly; create a free account and check back soon.', nav('/students', 'Open the marketplace'));
      const list = projects.slice(0, 8).map((p) => `- **${p.title}** — ${p.category}, ${p.level}, ${kes(p.price)}${p.demoVideoUrl ? ' (demo video available)' : ''}`).join('\n');
      return A(`**Available student projects**\n${list}`, nav('/students', 'Open the marketplace'));
    }
    return A('**MOTECH for Engineering Students** is a marketplace of complete engineering projects from MOTECH’s embedded-systems team.\n- Create a free student account\n- Browse projects and, where available, watch the demo video (up to 3 minutes) before buying\n- Pay securely with Paystack (card or M-Pesa, in KES)\n- Download the project files from **My Projects** as soon as payment is confirmed\n\nProjects are copyright MOTECH and licensed for personal study only; copying or resale is prohibited.',
    nav('/students', 'Open the marketplace'), nav('/register', 'Create an account'), nav('/students/my-projects', 'My projects'));
  }

  /* 7. buying and payment */
  if (has(q, 'how (do|can) i (buy|order|purchase|pay)', 'buy', 'purchase', 'checkout', 'paystack', 'm-?pesa', 'mpesa', 'pay(ment)?\\b', 'card\\b', 'bank (transfer|details)', 'refund', 'invoice', 'receipt', 'vat', 'bulk', 'wholesale', 'quotation', 'delivery', 'shipping')) {
    if (has(q, 'refund', 'invoice', 'receipt', 'vat', 'bulk', 'wholesale', 'quotation', 'delivery', 'shipping', 'dispute', 'wrong amount'))
    return A(`Refunds, invoices, VAT receipts, bulk or utility-scale pricing, quotations and delivery are handled by the MOTECH team directly. ${CONTACT} Please include your order number (from **My Orders**) so we can help quickly.`, nav('/#contact', 'Go to the contact section'));
    return howToBuy();
  }

  /* 8. accounts */
  if (has(q, 'forgot', 'reset (my )?password', 'cant (sign|log)', 'cannot (sign|log)', 'password', 'sign ?in', 'log ?in', 'register', 'sign ?up', 'create (an |my |a )?account', 'account'))
  return A('**Accounts**\n- **Create one:** Register with your name, email and a password of at least 8 characters.\n- **Sign in:** The same account works on any device and stays signed in.\n- **Forgot your password:** Use *Forgot password?* on the sign-in page; we email a reset link.\n- **Update details or change password:** open **Profile** after signing in.',
  live.user ? nav('/portal/profile', 'Open my profile') : nav('/login', 'Sign in'), live.user ? nav('/portal/orders', 'My orders') : nav('/register', 'Create an account'));

  /* 9. dashboard */
  if (has(q, 'dashboard', 'energy management', 'monitor(ing)? (my )?meters?'))
  return A('The **Energy Management Dashboard** is MOTECH’s cloud web app for smart-meter fleets: real-time and historical consumption, prepaid/postpaid billing, alerts and notifications, remote disconnect/reconnect, and analytics. It is hosted separately from this website.',
  { type: 'link', href: site.dashboardUrl, label: 'Open the Energy Dashboard' }, nav('/store/smart-energy-meter-sem-100', 'View the SEM-100'));

  /* 10. catalogue overview */
  if (has(q, 'products?', 'what do you (sell|offer|make|build)', 'offer', 'catalog', 'solutions?', 'services?', 'hardware', 'devices?')) {
    const items = live.catalog().filter((c) => c.status !== 'disabled').map((c) => `- **${c.name}** — ${c.summary} (${kes(c.price)})`).join('\n');
    return A(`**MOTECH products (online store)**\n${items}\n\nCore areas: ${coreAreas.join('; ')}. Ask about any product for specifications, applications and pricing.`, nav('/store', 'Open the store'), nav('/#solutions', 'View solutions'));
  }

  /* 11. company */
  if (has(q, 'contact', 'phone', 'whatsapp', 'email', 'call', 'reach', 'address', 'location', 'support', 'talk to', 'speak to'))
  return A(`You can reach MOTECH Embedded Engineering Ltd at ${CONTACT} You can also use the contact form on the home page.`, nav('/#contact', 'Go to the contact section'));
  if (has(q, 'about', 'who is motech', 'company', 'why (choose|motech)', 'mission', 'industries', 'sectors', 'customers? (are|include)', 'expertise'))
  return A(`**${site.name}** — *${site.motto}*\nWe design embedded systems, smart-energy technologies, IoT devices, data-analytics and network solutions.\n\n**Core areas:** ${coreAreas.join('; ')}.\n\n**Industries served:** ${industries.map((i) => i.label).join('; ')}.\n\n**Why MOTECH**\n${whyChoose.map((w) => `- **${w.title}:** ${w.body}`).join('\n')}`, nav('/#about', 'Read about us'));

  /* 12. technical concepts */
  const gl = GLOSSARY.filter((g) => g.re.test(q));
  if (gl.length) return A(gl.slice(0, 2).map((g) => `**${g.title}**\n${g.text}`).join('\n\n'), nav('/store', 'See related products'));

  /* 13. fallback: best-effort search over all product text */
  const qt = new Set(tokens(question));
  let best: { e: Entity; score: number } | null = null;
  for (const e of entities) {
    const text = e.store ? [e.store.description, e.store.summary, ...e.store.features, ...e.store.applications].join(' ') : homeProducts[e.homeIdx ?? 0]?.description ?? '';
    const hits = tokens(text).filter((t) => qt.has(t) && t.length > 3);
    const score = new Set(hits).size;
    if (!best || score > best.score) best = { e, score };
  }
  if (best && best.score >= 2)
  return A(`The closest match is **${best.e.name}**.\n\n${best.e.store?.summary ?? homeProducts[best.e.homeIdx ?? 0]?.tagline}\n\nAsk me for its specifications, features or price, or contact the team for a detailed engineering discussion: ${CONTACT}`, ...(best.e.store ? [nav(`/store/${best.e.store.slug}`, `View ${best.e.name}`)] : []));

  return A(`I’m not certain I understood that. I can help with MOTECH products and specifications, prices, buying and payment, the students marketplace, your orders, accounts and technical concepts such as prepaid metering or power quality.\n\nFor anything else, our engineers will gladly help: ${CONTACT}`, nav('/store', 'Open the store'), nav('/students', 'Students marketplace'));
}
