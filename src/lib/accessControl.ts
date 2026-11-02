import { bankDetails, catalog, protectedFiles } from '../data/catalog';
import type {
  DownloadGrant,
  License,
  Order,
  OrderStatus,
  PaymentProof,
  ProtectedFile,
  Session,
  StoreProduct,
  User } from
'../types/store';
import { getRemote } from './remote';

/**
 * MOTECH access-control service (client-side reference implementation).
 *
 * This module is the ONLY place that resolves protected resources. Every
 * download must pass `requestDownload`, which enforces, in order:
 *   1. a valid, unexpired session          (authentication)
 *   2. an enabled account                  (account state)
 *   3. a verified order for the product     (payment verification)
 *   4. an active licence                    (digital rights)
 *   5. file-to-product membership           (resource scoping)
 * and only then issues a single-use, expiring grant token.
 *
 * Storage locations are never modelled or returned. In production this file is
 * replaced by server endpoints and object-storage signed URLs; the UI contract
 * below (async functions returning results or thrown errors) stays identical.
 */

const STORE_KEY = 'motech.portal.v1';
const SESSION_KEY = 'motech.session.v1';
const GRANT_TTL_SECONDS = 120;

type Db = {
  users: Array<User & {password: string;}>;
  orders: Order[];
  licenses: License[];
  products: StoreProduct[];
  files: ProtectedFile[];
};

type Grant = {
  token: string;
  fileId: string;
  userId: string;
  expiresAt: number;
  consumed: boolean;
};

/** Non-reversible-enough digest for a browser reference build. */
function digest(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < value.length; i++) {
    h1 = (h1 ^ value.charCodeAt(i)) * 0x01000193;
    h2 = h2 + value.charCodeAt(i) * (i + 7) >>> 0;
  }
  return `mh$${(h1 >>> 0).toString(16)}${h2.toString(16)}`;
}

function rand(len = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++)
  out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function nowIso(): string {
  return new Date().toISOString();
}

const ADMIN_EMAIL = 'motechembeddedengineering@gmail.com';

function seed(): Db {
  return {
    users: [
    {
      id: 'usr-admin',
      name: 'MOTECH Administrator',
      email: ADMIN_EMAIL,
      company: 'MOTECH Embedded Engineering Ltd',
      phone: '+254791052537',
      role: 'admin',
      disabled: false,
      createdAt: nowIso(),
      password: digest('Mohanelli11!')
    }],

    orders: [],
    licenses: [],
    products: catalog,
    files: protectedFiles
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const fresh = seed();
      localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Db;
    if (!parsed.products?.length) parsed.products = catalog;
    if (!parsed.files?.length) parsed.files = protectedFiles;
    return parsed;
  } catch {
    return seed();
  }
}

function save(db: Db): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

/** In-memory only: grants never survive a reload, by design. */
const grants = new Map<string, Grant>();

const delay = (ms = 420) => new Promise((r) => setTimeout(r, ms));

function publicUser(u: User & {password: string;}): User {
  const { password: _password, ...rest } = u;
  return rest;
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** Local-only fallback sessions last 8h; with the shared backend the device session is long-lived. */
const LOCAL_SESSION_MS = 1000 * 60 * 60 * 8;
const REMOTE_SESSION_MS = 1000 * 60 * 60 * 24 * 30;

function writeSession(userId: string, ttlMs = LOCAL_SESSION_MS): Session {
  const s: Session = {
    token: `mts_${rand(24)}`,
    userId,
    expiresAt: Date.now() + ttlMs
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

/**
 * With the shared backend the signed-in account lives in the central database. Orders and licences
 * are still kept per device, so keep a password-less copy of the account in the local store and
 * point this device's session at it.
 */
function mirrorRemoteUser(u: User): void {
  const db = load();
  const record = { ...u, password: '' };
  const i = db.users.findIndex((x) => x.id === u.id);
  if (i >= 0) db.users[i] = record;else db.users.push(record);
  save(db);
  writeSession(u.id, REMOTE_SESSION_MS);
}

function requireUser(db: Db): User & {password: string;} {
  const session = readSession();
  if (!session) throw new Error('Your session has expired. Please sign in again.');
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) throw new Error('Account not found.');
  if (user.disabled)
  throw new Error('This account has been disabled. Contact MOTECH support.');
  return user;
}

function requireAdmin(db: Db): User & {password: string;} {
  const user = requireUser(db);
  if (user.role !== 'admin') throw new Error('Administrator privileges required.');
  return user;
}

export const api = {
  bankDetails,

  /* ---------------------------------------------------------------- session */

  currentUser(): User | null {
    const db = load();
    const session = readSession();
    if (!session) return null;
    const user = db.users.find((u) => u.id === session.userId);
    return user && !user.disabled ? publicUser(user) : null;
  },

  async register(input: {
    name: string;
    email: string;
    password: string;
    company: string;
    phone: string;
  }): Promise<User | null> {
    await delay();
    const remote = getRemote();
    if (remote) {
      if (input.password.length < 8)
      throw new Error('Password must be at least 8 characters.');
      const { user } = await remote.signUp(input);
      if (!user) return null; // email confirmation required: no session yet
      mirrorRemoteUser(user);
      return user;
    }
    const db = load();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === email))
    throw new Error('An account with this email already exists.');
    if (input.password.length < 8)
    throw new Error('Password must be at least 8 characters.');
    const user: User & {password: string;} = {
      id: `usr-${rand(6).toLowerCase()}`,
      name: input.name.trim(),
      email,
      company: input.company.trim(),
      phone: input.phone.trim(),
      role: 'customer',
      disabled: false,
      createdAt: nowIso(),
      password: digest(input.password)
    };
    db.users.push(user);
    save(db);
    writeSession(user.id);
    return publicUser(user);
  },

  async login(email: string, password: string): Promise<User> {
    await delay();
    const remote = getRemote();
    if (remote) {
      const user = await remote.signIn(email, password);
      mirrorRemoteUser(user);
      return user;
    }
    const db = load();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || user.password !== digest(password))
    throw new Error('Incorrect email or password.');
    if (user.disabled)
    throw new Error('This account has been disabled. Contact MOTECH support.');
    writeSession(user.id);
    return publicUser(user);
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    grants.clear();
    void getRemote()?.signOut().catch(() => undefined);
  },

  /** True when accounts are stored in the shared database (not just this browser). */
  isRemote(): boolean {
    return getRemote() !== null;
  },

  /**
   * Call once at start-up. Restores this device's signed-in account from the shared backend so a
   * customer stays signed in between visits. Resolves to the user, or null when signed out.
   */
  async init(): Promise<User | null> {
    const remote = getRemote();
    if (!remote) return api.currentUser();
    const user = await remote.restore();
    if (user) mirrorRemoteUser(user);else
    sessionStorage.removeItem(SESSION_KEY);
    return user;
  },

  /** Fires when the session ends elsewhere (other tab, expiry). Returns an unsubscribe function. */
  onSignedOut(cb: () => void): () => void {
    const remote = getRemote();
    if (!remote) return () => undefined;
    return remote.onSignedOut(() => {
      sessionStorage.removeItem(SESSION_KEY);
      cb();
    });
  },

  /** State of the emailed password-reset link (shared backend only). */
  recovery(): { active: boolean; error: string | null } {
    return getRemote()?.recovery() ?? { active: false, error: null };
  },

  /** Finish a password reset started from the emailed link. */
  async completeRecovery(password: string): Promise<void> {
    await delay();
    const remote = getRemote();
    if (!remote) throw new Error('Password reset by email is not available.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    await remote.updatePassword(password);
    await remote.signOut(); // make them sign in with the new password
    sessionStorage.removeItem(SESSION_KEY);
  },

  async requestPasswordReset(email: string): Promise<string> {
    await delay();
    const remote = getRemote();
    if (remote) {
      await remote.requestPasswordReset(email);
      return ''; // the link is emailed; nothing is shown on screen
    }
    const db = load();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    // Never disclose whether an account exists.
    return user ? `MTRST-${rand(10)}` : `MTRST-${rand(10)}`;
  },

  async completePasswordReset(
  email: string,
  code: string,
  password: string)
  : Promise<void> {
    await delay();
    if (!/^MTRST-[A-Z0-9]{10}$/.test(code.trim()))
    throw new Error('That reset code is not valid.');
    if (password.length < 8)
    throw new Error('Password must be at least 8 characters.');
    const db = load();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user) throw new Error('That reset code is not valid.');
    user.password = digest(password);
    save(db);
  },

  async updateProfile(patch: {
    name: string;
    company: string;
    phone: string;
  }): Promise<User> {
    await delay();
    const remote = getRemote();
    if (remote) {
      const updated = await remote.updateProfile(patch);
      mirrorRemoteUser(updated);
      return updated;
    }
    const db = load();
    const user = requireUser(db);
    user.name = patch.name.trim();
    user.company = patch.company.trim();
    user.phone = patch.phone.trim();
    save(db);
    return publicUser(user);
  },

  async changePassword(current: string, next: string): Promise<void> {
    await delay();
    const remote = getRemote();
    if (remote) {
      const me = requireUser(load());
      if (!(await remote.verifyPassword(me.email, current)))
      throw new Error('Current password is incorrect.');
      if (next.length < 8) throw new Error('Password must be at least 8 characters.');
      await remote.updatePassword(next);
      return;
    }
    const db = load();
    const user = requireUser(db);
    if (user.password !== digest(current))
    throw new Error('Current password is incorrect.');
    if (next.length < 8) throw new Error('Password must be at least 8 characters.');
    user.password = digest(next);
    save(db);
  },

  /* --------------------------------------------------------------- catalogue */

  listProducts(includeDisabled = false): StoreProduct[] {
    const db = load();
    return db.products.filter((p) => includeDisabled || p.status !== 'disabled');
  },

  getProduct(slug: string): StoreProduct | undefined {
    return load().products.find((p) => p.slug === slug);
  },

  /** Metadata only — titles and versions, never locations. */
  listProductFiles(productId: string): ProtectedFile[] {
    return load().files.filter((f) => f.productId === productId);
  },

  /* ------------------------------------------------------------------ orders */

  async createOrder(productId: string): Promise<Order> {
    await delay();
    const db = load();
    const user = requireUser(db);
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found.');
    if (product.status === 'disabled')
    throw new Error('This product is not currently available.');
    const seq = String(db.orders.length + 1).padStart(4, '0');
    const order: Order = {
      id: `MT-ORD-${new Date().getFullYear()}-${seq}`,
      reference: `MTPAY-${rand(6)}-${seq}`,
      userId: user.id,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      currency: 'KES',
      status: 'awaiting_payment',
      createdAt: nowIso(),
      reviewedAt: null,
      proof: null,
      adminNote: '',
      licenseId: null
    };
    db.orders.unshift(order);
    save(db);
    return order;
  },

  getOrder(orderId: string): Order | undefined {
    const db = load();
    const user = requireUser(db);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    if (user.role !== 'admin' && order.userId !== user.id)
    throw new Error('You do not have access to this order.');
    return order;
  },

  myOrders(): Order[] {
    const db = load();
    const user = requireUser(db);
    return db.orders.filter((o) => o.userId === user.id);
  },

  myLicenses(): License[] {
    const db = load();
    const user = requireUser(db);
    return db.licenses.filter((l) => l.userId === user.id);
  },

  async submitPaymentProof(
  orderId: string,
  proof: PaymentProof)
  : Promise<Order> {
    await delay(700);
    const db = load();
    const user = requireUser(db);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order || order.userId !== user.id) throw new Error('Order not found.');
    if (order.status === 'verified')
    throw new Error('This order has already been verified.');
    order.proof = proof;
    order.status = 'under_review';
    save(db);
    return order;
  },

  /* ---------------------------------------------------- protected downloads */

  /** True only when the signed-in user holds verified, licensed access. */
  hasAccess(productId: string): boolean {
    try {
      const db = load();
      const user = requireUser(db);
      if (user.role === 'admin') return true;
      const order = db.orders.find(
        (o) =>
        o.userId === user.id &&
        o.productId === productId &&
        o.status === 'verified'
      );
      if (!order) return false;
      return db.licenses.some(
        (l) =>
        l.orderId === order.id && l.userId === user.id && l.status === 'active'
      );
    } catch {
      return false;
    }
  },

  /**
   * Broker a download. Returns an opaque, single-use, expiring grant token —
   * never a storage path. All five access checks run server-side in production.
   */
  async requestDownload(fileId: string): Promise<DownloadGrant> {
    await delay(500);
    const db = load();
    const user = requireUser(db); // 1 + 2: authenticated, enabled
    const file = db.files.find((f) => f.id === fileId);
    if (!file) throw new Error('Resource not found.');

    if (user.role !== 'admin') {
      const order = db.orders.find(
        (o) =>
        o.userId === user.id &&
        o.productId === file.productId &&
        o.status === 'verified'
      );
      if (!order)
      throw new Error(
        'Access denied: no verified payment on record for this product.'
      );
      const license = db.licenses.find(
        (l) =>
        l.orderId === order.id && l.userId === user.id && l.status === 'active'
      );
      if (!license)
      throw new Error('Access denied: your licence for this product is not active.');
      // 5: the requested file must belong to the licensed product
      if (license.productId !== file.productId)
      throw new Error('Access denied: resource is outside your licence scope.');
    }

    const grant: Grant = {
      token: `mtdl_${rand(28)}`,
      fileId: file.id,
      userId: user.id,
      expiresAt: Date.now() + GRANT_TTL_SECONDS * 1000,
      consumed: false
    };
    grants.set(grant.token, grant);
    return {
      token: grant.token,
      fileTitle: file.title,
      expiresAt: grant.expiresAt,
      ttlSeconds: GRANT_TTL_SECONDS
    };
  },

  /** Redeem a grant exactly once, before it expires. */
  async redeemDownload(token: string): Promise<{fileName: string;body: string;}> {
    await delay(350);
    const db = load();
    const user = requireUser(db);
    const grant = grants.get(token);
    if (!grant) throw new Error('This download link is not valid.');
    if (grant.userId !== user.id)
    throw new Error('This download link was issued to another account.');
    if (grant.consumed) throw new Error('This download link has already been used.');
    if (grant.expiresAt < Date.now()) {
      grants.delete(token);
      throw new Error('This download link has expired. Request a new one.');
    }
    grant.consumed = true;
    const file = db.files.find((f) => f.id === grant.fileId);
    if (!file) throw new Error('Resource not found.');
    const license = db.licenses.find(
      (l) => l.userId === user.id && l.productId === file.productId
    );
    const body = [
    'MOTECH EMBEDDED ENGINEERING LTD — PROTECTED RESOURCE',
    '======================================================',
    `Resource : ${file.title}`,
    `Category : ${file.category}`,
    `Version  : ${file.version} (${file.format}, ${file.sizeLabel})`,
    `Licence  : ${license?.id ?? 'ADMIN-ACCESS'}`,
    `Issued to: ${user.name} <${user.email}>`,
    `Delivered: ${new Date().toUTCString()}`,
    '',
    'This file was delivered through an authenticated, single-use link.',
    'Redistribution outside your licence terms is prohibited.'].
    join('\n');
    return {
      fileName: `${file.title.replace(/[^\w.-]+/g, '_')}_${file.version}.txt`,
      body
    };
  },

  /* ------------------------------------------------------------------- admin */

  adminStats() {
    const db = load();
    requireAdmin(db);
    return {
      products: db.products.length,
      files: db.files.length,
      customers: db.users.filter((u) => u.role === 'customer').length,
      pending: db.orders.filter((o) => o.status === 'under_review').length,
      awaiting: db.orders.filter((o) => o.status === 'awaiting_payment').length,
      verified: db.orders.filter((o) => o.status === 'verified').length,
      revenue: db.orders.
      filter((o) => o.status === 'verified').
      reduce((sum, o) => sum + o.amount, 0),
      activeLicenses: db.licenses.filter((l) => l.status === 'active').length
    };
  },

  /** Number of customer accounts (central count when the shared backend is on). */
  async adminCustomerCount(): Promise<number> {
    requireAdmin(load());
    const remote = getRemote();
    if (remote) return (await remote.listCustomers()).length;
    return load().users.filter((u) => u.role === 'customer').length;
  },

  adminOrders(): Array<Order & {customer: User | null;}> {
    const db = load();
    requireAdmin(db);
    return db.orders.map((o) => ({
      ...o,
      customer: (() => {
        const u = db.users.find((x) => x.id === o.userId);
        return u ? publicUser(u) : null;
      })()
    }));
  },

  /** Every customer account. With the shared backend this is the central list, from any device. */
  async adminCustomers(): Promise<
    Array<User & {orders: number;verified: number;licenses: number;spend: number;}>>
  {
    const db = load();
    requireAdmin(db);
    const remote = getRemote();
    const accounts: User[] = remote ?
    await remote.listCustomers() :
    db.users.filter((u) => u.role === 'customer').map(publicUser);
    return accounts.
    map((u) => {
      const orders = db.orders.filter((o) => o.userId === u.id);
      return {
        ...u,
        orders: orders.length,
        verified: orders.filter((o) => o.status === 'verified').length,
        licenses: db.licenses.filter(
          (l) => l.userId === u.id && l.status === 'active'
        ).length,
        spend: orders.
        filter((o) => o.status === 'verified').
        reduce((s, o) => s + o.amount, 0)
      };
    });
  },

  adminLicenses(): License[] {
    const db = load();
    requireAdmin(db);
    return db.licenses;
  },

  /** Approving payment is what issues the licence and unlocks resources. */
  async adminSetOrderStatus(
  orderId: string,
  status: Extract<OrderStatus, 'verified' | 'rejected' | 'awaiting_payment'>,
  note = '')
  : Promise<Order> {
    await delay();
    const db = load();
    requireAdmin(db);
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    order.status = status;
    order.adminNote = note;
    order.reviewedAt = nowIso();

    if (status === 'verified' && !order.licenseId) {
      const license: License = {
        id: `MTL-${new Date().getFullYear()}-${rand(5)}-${rand(4)}`,
        orderId: order.id,
        userId: order.userId,
        productId: order.productId,
        issuedAt: nowIso(),
        status: 'active'
      };
      db.licenses.push(license);
      order.licenseId = license.id;
    }
    if (status !== 'verified' && order.licenseId) {
      const license = db.licenses.find((l) => l.id === order.licenseId);
      if (license) license.status = 'deactivated';
    }
    save(db);
    return order;
  },

  async adminSetLicenseStatus(
  licenseId: string,
  status: 'active' | 'deactivated')
  : Promise<void> {
    await delay(300);
    const db = load();
    requireAdmin(db);
    const license = db.licenses.find((l) => l.id === licenseId);
    if (!license) throw new Error('Licence not found.');
    license.status = status;
    save(db);
  },

  async adminSetUserDisabled(userId: string, disabled: boolean): Promise<void> {
    await delay(300);
    const db = load();
    requireAdmin(db);
    const remote = getRemote();
    if (remote) {
      await remote.setDisabled(userId, disabled);
      return;
    }
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Customer not found.');
    if (user.role === 'admin') throw new Error('Administrator accounts cannot be disabled.');
    user.disabled = disabled;
    save(db);
  },

  /** Revoke every licence held by a customer. */
  async adminResetAccess(userId: string): Promise<void> {
    await delay(300);
    const db = load();
    requireAdmin(db);
    db.licenses.
    filter((l) => l.userId === userId).
    forEach((l) => {
      l.status = 'deactivated';
    });
    save(db);
  },

  async adminSaveProduct(product: StoreProduct): Promise<void> {
    await delay(350);
    const db = load();
    requireAdmin(db);
    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) db.products[idx] = product;else
    db.products.unshift(product);
    save(db);
  },

  async adminDeleteProduct(productId: string): Promise<void> {
    await delay(300);
    const db = load();
    requireAdmin(db);
    db.products = db.products.filter((p) => p.id !== productId);
    db.files = db.files.filter((f) => f.productId !== productId);
    save(db);
  },

  async adminUploadFile(input: {
    productId: string;
    title: string;
    category: ProtectedFile['category'];
    format: string;
    sizeLabel: string;
    version: string;
  }): Promise<ProtectedFile> {
    await delay(600);
    const db = load();
    requireAdmin(db);
    if (!db.products.some((p) => p.id === input.productId))
    throw new Error('Select a product for this resource.');
    const file: ProtectedFile = {
      id: `f-${rand(8).toLowerCase()}`,
      productId: input.productId,
      title: input.title.trim(),
      category: input.category,
      format: input.format.trim() || 'PDF',
      sizeLabel: input.sizeLabel.trim() || '—',
      version: input.version.trim() || 'v1.0',
      uploadedAt: nowIso().slice(0, 10)
    };
    db.files.unshift(file);
    save(db);
    return file;
  },

  async adminDeleteFile(fileId: string): Promise<void> {
    await delay(250);
    const db = load();
    requireAdmin(db);
    db.files = db.files.filter((f) => f.id !== fileId);
    save(db);
  },

  adminAllFiles(): ProtectedFile[] {
    const db = load();
    requireAdmin(db);
    return db.files;
  }
};

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ?
  value :
  d.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ?
  value :
  `${formatDate(value)} · ${d.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}