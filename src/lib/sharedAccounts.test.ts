import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from './accessControl';
import { __setRemoteForTests, type RemoteAuth, type SignUpInput } from './remote';
import type { User } from '../types/store';

/**
 * An in-memory stand-in for the shared accounts database. Every "device" gets its own
 * RemoteAuth bound to its own sign-in state, but they all talk to the SAME server - exactly the
 * situation of a customer on a phone and an admin on a laptop.
 */
class FakeServer {
  users = new Map<string, {profile: User;password: string;}>();
  resetLinks = new Map<string, string>(); // token -> email
  confirmEmail = false;
  seq = 0;

  create(input: SignUpInput, role: 'admin' | 'customer' = 'customer'): User {
    const profile: User = {
      id: `uuid-${++this.seq}`,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      company: input.company,
      phone: input.phone,
      role,
      disabled: false,
      createdAt: new Date().toISOString()
    };
    this.users.set(profile.email, { profile, password: input.password });
    return profile;
  }

  device(): RemoteAuth {
    let signedInId: string | null = null;
    let recovery = false;
    const server = this;
    const me = () => [...server.users.values()].find((u) => u.profile.id === signedInId);
    const listeners = new Set<() => void>();
    return {
      commerce: {
        fetchAll: async () => ({ orders: [], licenses: [], prices: [] }),
        startPayment: async () => { throw new Error('n/a'); },
        verifyPayment: async () => ({ status: 'awaiting_payment', paystackStatus: 'abandoned', reason: null }),
        savePrice: async () => {}, deletePrice: async () => {}, revokeOrder: async () => {}, setLicenseStatus: async () => {}
      },
      async restore() {
        const u = me();
        return u && !u.profile.disabled ? { ...u.profile } : null;
      },
      async signUp(input) {
        if (input.password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (server.users.has(input.email.trim().toLowerCase()))
        throw new Error('An account with this email already exists.');
        const profile = server.create(input);
        if (server.confirmEmail) return { user: null, needsEmailConfirmation: true };
        signedInId = profile.id;
        return { user: { ...profile }, needsEmailConfirmation: false };
      },
      async signIn(email, password) {
        const u = server.users.get(email.trim().toLowerCase());
        if (!u || u.password !== password) throw new Error('Incorrect email or password.');
        if (u.profile.disabled) throw new Error('This account has been disabled. Contact MOTECH support.');
        signedInId = u.profile.id;
        return { ...u.profile };
      },
      async signOut() {
        signedInId = null;
        listeners.forEach((cb) => cb());
      },
      async requestPasswordReset(email) {
        if (server.users.has(email.trim().toLowerCase())) server.resetLinks.set(`tok-${server.seq++}`, email.trim().toLowerCase());
      },
      async updatePassword(password) {
        const u = me();
        if (!u) throw new Error('Your session has expired. Please sign in again.');
        u.password = password;
        recovery = false;
      },
      async verifyPassword(email, password) {
        return server.users.get(email.trim().toLowerCase())?.password === password;
      },
      async updateProfile(patch) {
        const u = me();
        if (!u) throw new Error('Your session has expired. Please sign in again.');
        Object.assign(u.profile, patch);
        return { ...u.profile };
      },
      async listCustomers() {
        if (me()?.profile.role !== 'admin') throw new Error('You do not have permission to do that.');
        return [...server.users.values()].filter((u) => u.profile.role === 'customer').map((u) => ({ ...u.profile }));
      },
      async setDisabled(id, flag) {
        if (me()?.profile.role !== 'admin') throw new Error('You do not have permission to do that.');
        const t = [...server.users.values()].find((u) => u.profile.id === id);
        if (t && t.profile.role !== 'admin') t.profile.disabled = flag;
      },
      onSignedOut(cb) {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      recovery() {
        return { active: recovery, error: null };
      },
      /** test helper: what happens when the person clicks the emailed link on this device */
      openResetLink(email: string) {
        const u = server.users.get(email);
        signedInId = u!.profile.id;
        recovery = true;
      }
    } as RemoteAuth & {openResetLink(email: string): void;};
  }
}

/** Switch to a different physical device: its browser storage starts empty. */
function onDevice(remote: RemoteAuth | null) {
  localStorage.clear();
  sessionStorage.clear();
  __setRemoteForTests(remote);
}

const jane = { name: 'Jane Mwangi', email: 'Jane@Company.com', password: 'S3cure-pass!', company: 'Acme', phone: '+254700000001' };

describe('shared accounts (the problems that were reported)', () => {
  let server: FakeServer;
  beforeEach(() => {
    server = new FakeServer();
    server.create({ name: 'MOTECH Administrator', email: 'motechembeddedengineering@gmail.com', password: 'Admin-pass-1', company: 'MOTECH', phone: '' }, 'admin');
  });
  afterEach(() => __setRemoteForTests(undefined));

  it('admin on ANOTHER device sees an account a customer created on their phone', async () => {
    onDevice(server.device()); // customer's phone
    await api.register(jane);
    onDevice(server.device()); // admin's laptop - completely separate browser storage
    await api.login('motechembeddedengineering@gmail.com', 'Admin-pass-1');
    const customers = await api.adminCustomers();
    expect(customers.map((c) => c.email)).toEqual(['jane@company.com']);
    expect(customers[0]).toMatchObject({ name: 'Jane Mwangi', company: 'Acme', phone: '+254700000001' });
    expect(await api.adminCustomerCount()).toBe(1);
  });

  it('every new account appears for the admin, newest included, from any device', async () => {
    for (const n of [1, 2, 3]) {
      onDevice(server.device());
      await api.register({ ...jane, email: `user${n}@x.com` });
    }
    onDevice(server.device());
    await api.login('motechembeddedengineering@gmail.com', 'Admin-pass-1');
    expect((await api.adminCustomers()).map((c) => c.email).sort()).toEqual(['user1@x.com', 'user2@x.com', 'user3@x.com']);
  });

  it('the password a customer set works on any device, any time (no "forgot password" needed)', async () => {
    onDevice(server.device());
    await api.register(jane);
    api.logout();

    onDevice(server.device()); // a different phone / laptop
    const user = await api.login('jane@company.com', 'S3cure-pass!');
    expect(user.email).toBe('jane@company.com');

    localStorage.clear(); // "clear site data" on the same device, then sign in again
    sessionStorage.clear();
    expect((await api.login('JANE@company.com', 'S3cure-pass!')).name).toBe('Jane Mwangi');

    await expect(api.login('jane@company.com', 'wrong-password')).rejects.toThrow('Incorrect email or password.');
  });

  it('a signed-in customer is restored on the next visit (init) without typing the password', async () => {
    const device = server.device();
    onDevice(device);
    await api.register(jane);
    sessionStorage.clear(); // tab closed and reopened
    const restored = await api.init();
    expect(restored?.email).toBe('jane@company.com');
    expect(api.currentUser()?.email).toBe('jane@company.com');
  });

  it('rejects a duplicate email and short passwords', async () => {
    onDevice(server.device());
    await api.register(jane);
    onDevice(server.device());
    await expect(api.register(jane)).rejects.toThrow('already exists');
    await expect(api.register({ ...jane, email: 'new@x.com', password: 'short' })).rejects.toThrow('at least 8');
  });

  it('when email confirmation is required, register reports it instead of failing', async () => {
    server.confirmEmail = true;
    onDevice(server.device());
    expect(await api.register(jane)).toBeNull();
    expect(api.currentUser()).toBeNull();
    onDevice(server.device());
    expect((await api.login('jane@company.com', 'S3cure-pass!')).email).toBe('jane@company.com');
  });

  it('a customer cannot see the customer list', async () => {
    onDevice(server.device());
    await api.register(jane);
    await expect(api.adminCustomers()).rejects.toThrow('Administrator privileges required');
  });

  it('admin can disable an account and the customer is then blocked everywhere', async () => {
    onDevice(server.device());
    const created = await api.register(jane);
    onDevice(server.device());
    await api.login('motechembeddedengineering@gmail.com', 'Admin-pass-1');
    await api.adminSetUserDisabled(created!.id, true);
    onDevice(server.device());
    await expect(api.login('jane@company.com', 'S3cure-pass!')).rejects.toThrow('disabled');
  });

  it('changing the password works across devices and retires the old one', async () => {
    onDevice(server.device());
    await api.register(jane);
    await expect(api.changePassword('not-current', 'N3w-password!')).rejects.toThrow('Current password is incorrect');
    await api.changePassword('S3cure-pass!', 'N3w-password!');
    onDevice(server.device());
    await expect(api.login('jane@company.com', 'S3cure-pass!')).rejects.toThrow('Incorrect');
    expect((await api.login('jane@company.com', 'N3w-password!')).email).toBe('jane@company.com');
  });

  it('profile edits are saved centrally', async () => {
    onDevice(server.device());
    await api.register(jane);
    await api.updateProfile({ name: 'Jane M.', company: 'Acme Ltd', phone: '+254711' });
    onDevice(server.device());
    await api.login('motechembeddedengineering@gmail.com', 'Admin-pass-1');
    expect((await api.adminCustomers())[0]).toMatchObject({ name: 'Jane M.', company: 'Acme Ltd', phone: '+254711' });
  });

  it('password reset by emailed link sets a password that works on any device', async () => {
    onDevice(server.device());
    await api.register(jane);
    api.logout();

    const phone = server.device() as RemoteAuth & {openResetLink(e: string): void;};
    onDevice(phone);
    expect(await api.requestPasswordReset('jane@company.com')).toBe(''); // nothing shown on screen
    expect([...server.resetLinks.values()]).toEqual(['jane@company.com']);
    expect(api.recovery().active).toBe(false);

    phone.openResetLink('jane@company.com'); // she clicks the link in her email
    expect(api.recovery().active).toBe(true);
    await expect(api.completeRecovery('short')).rejects.toThrow('at least 8');
    await api.completeRecovery('Brand-new-pass1');
    expect(api.currentUser()).toBeNull(); // signed out afterwards

    onDevice(server.device());
    expect((await api.login('jane@company.com', 'Brand-new-pass1')).email).toBe('jane@company.com');
  });

  it('asking for a reset for an unknown email reveals nothing', async () => {
    onDevice(server.device());
    await expect(api.requestPasswordReset('nobody@nowhere.com')).resolves.toBe('');
    expect(server.resetLinks.size).toBe(0);
  });
});

describe('browser-only fallback (shared accounts not configured)', () => {
  afterEach(() => __setRemoteForTests(undefined));

  it('still works on one device but, as before, is invisible to other devices', async () => {
    onDevice(null);
    expect(api.isRemote()).toBe(false);
    await api.register(jane);
    api.logout();
    expect((await api.login('jane@company.com', 'S3cure-pass!')).email).toBe('jane@company.com');
    onDevice(null); // another device: nothing there
    await expect(api.login('jane@company.com', 'S3cure-pass!')).rejects.toThrow('Incorrect email or password.');
  });
});

describe('real backend client', () => {
  afterEach(() => {
    __setRemoteForTests(undefined);
  });

  it('is only enabled when both Supabase settings are present, and reports network problems politely', async () => {
    const { vi } = await import('vitest');
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const off = await import('./remote');
    expect(off.getRemote()).toBeNull();

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'http://127.0.0.1:9'); // nothing listens here
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    const on = await import('./remote');
    const remote = on.getRemote();
    expect(remote).not.toBeNull();
    await expect(remote!.signIn('a@b.co', 'password123')).rejects.toThrow(/Cannot reach the server/);
    vi.unstubAllEnvs();
  });
});
