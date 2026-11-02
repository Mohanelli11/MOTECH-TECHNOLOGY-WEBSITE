import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../types/store';

/**
 * Shared accounts backend (Supabase).
 *
 * Accounts and passwords live in ONE central database instead of each visitor's browser, so:
 *   - a customer who registers on a phone can sign in from any other device with the same password,
 *   - the administrator sees every account no matter which device they use,
 *   - password resets are emailed to the account holder.
 *
 * When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set the site falls back to the old
 * browser-only storage (see accessControl.ts), so nothing breaks while the backend is being set up.
 */

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  company: string;
  phone: string;
};

export interface RemoteAuth {
  /** The signed-in user for this device (restored from the stored session), or null. */
  restore(): Promise<User | null>;
  /** user is null when the project requires the customer to confirm their email first. */
  signUp(input: SignUpInput): Promise<{ user: User | null; needsEmailConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  /** Emails a reset link to the account holder. Never reveals whether the email exists. */
  requestPasswordReset(email: string): Promise<void>;
  /** Sets a new password for the signed-in (or recovery-link) session. */
  updatePassword(password: string): Promise<void>;
  /** True if `password` is the signed-in user's current password. */
  verifyPassword(email: string, password: string): Promise<boolean>;
  updateProfile(patch: { name: string; company: string; phone: string }): Promise<User>;
  /** Administrators only (enforced by the database). */
  listCustomers(): Promise<User[]>;
  setDisabled(userId: string, disabled: boolean): Promise<void>;
  /** Fires when the session ends (signed out here, in another tab, or expired). */
  onSignedOut(cb: () => void): () => void;
  /** Password-reset link state for the /reset-password page. */
  recovery(): { active: boolean; error: string | null };
}

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  role: 'customer' | 'admin';
  disabled: boolean;
  created_at: string;
};

const toUser = (r: ProfileRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  company: r.company,
  phone: r.phone,
  role: r.role,
  disabled: r.disabled,
  createdAt: r.created_at
});

/** Turn Supabase's technical messages into something a customer can act on. */
export function friendlyAuthError(err: unknown): Error {
  const msg = String((err as { message?: string } | null)?.message ?? err ?? '');
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return new Error('Incorrect email or password.');
  if (m.includes('already registered') || m.includes('already been registered'))
  return new Error('An account with this email already exists.');
  if (m.includes('email not confirmed'))
  return new Error('Please confirm your email address first — check your inbox for our message.');
  if (m.includes('rate limit') || m.includes('too many'))
  return new Error('Too many attempts. Please wait a few minutes and try again.');
  if (m.includes('password') && (m.includes('least') || m.includes('weak') || m.includes('short')))
  return new Error('Password must be at least 8 characters.');
  if (m.includes('same password')) return new Error('Choose a password different from your current one.');
  if (m.includes('failed to fetch') || m.includes('fetch failed') || m.includes('network') || m.includes('load failed'))
  return new Error('Cannot reach the server. Check your internet connection and try again.');
  if (m.includes('not allowed') || m.includes('privileges')) return new Error('You do not have permission to do that.');
  return new Error(msg || 'Something went wrong. Please try again.');
}

/* Read the reset-link state from the URL BEFORE the Supabase client strips the hash. */
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
let recoveryActive = /type=recovery/.test(initialHash);
let recoveryError: string | null = null;
if (/error_code=|error=access_denied/.test(initialHash)) {
  recoveryError = /otp_expired|expired/.test(initialHash) ?
  'This reset link has expired or was already used. Request a new one below.' :
  'This reset link is not valid. Request a new one below.';
}

function createSupabaseRemote(sb: SupabaseClient): RemoteAuth {
  const signedOutListeners = new Set<() => void>();
  sb.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') recoveryActive = true;
    if (event === 'SIGNED_OUT') signedOutListeners.forEach((cb) => cb());
  });

  async function fetchProfile(userId: string): Promise<User> {
    // The profile is created by a database trigger in the same transaction as the sign-up,
    // but give it a moment in case of replication delay.
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw friendlyAuthError(error);
      if (data) return toUser(data as ProfileRow);
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
    throw new Error('Your account profile could not be loaded. Please try again.');
  }

  return {
    async restore() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      try {
        const user = await fetchProfile(data.session.user.id);
        if (user.disabled) {
          await sb.auth.signOut();
          return null;
        }
        return user;
      } catch {
        return null;
      }
    },

    async signUp(input) {
      const { data, error } = await sb.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          data: { name: input.name.trim(), company: input.company.trim(), phone: input.phone.trim() },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw friendlyAuthError(error);
      // With "confirm email" on, an already-registered address returns a user with no identities.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
      throw new Error('An account with this email already exists.');
      if (!data.session || !data.user) return { user: null, needsEmailConfirmation: true };
      return { user: await fetchProfile(data.user.id), needsEmailConfirmation: false };
    },

    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error) throw friendlyAuthError(error);
      const user = await fetchProfile(data.user.id);
      if (user.disabled) {
        await sb.auth.signOut();
        throw new Error('This account has been disabled. Contact MOTECH support.');
      }
      return user;
    },

    async signOut() {
      await sb.auth.signOut();
    },

    async requestPasswordReset(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      // Rate limits are worth surfacing; "unknown email" never errors, so nothing is disclosed.
      if (error && /rate|too many/i.test(error.message)) throw friendlyAuthError(error);
    },

    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw friendlyAuthError(error);
      recoveryActive = false;
    },

    async verifyPassword(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      return !error;
    },

    async updateProfile(patch) {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) throw new Error('Your session has expired. Please sign in again.');
      const { error } = await sb.
      from('profiles').
      update({ name: patch.name.trim(), company: patch.company.trim(), phone: patch.phone.trim() }).
      eq('id', s.session.user.id);
      if (error) throw friendlyAuthError(error);
      return fetchProfile(s.session.user.id);
    },

    async listCustomers() {
      const { data, error } = await sb.
      from('profiles').
      select('*').
      eq('role', 'customer').
      order('created_at', { ascending: false });
      if (error) throw friendlyAuthError(error);
      return (data as ProfileRow[]).map(toUser);
    },

    async setDisabled(userId, disabled) {
      const { error } = await sb.rpc('admin_set_user_disabled', { target: userId, flag: disabled });
      if (error) throw friendlyAuthError(error);
    },

    onSignedOut(cb) {
      signedOutListeners.add(cb);
      return () => signedOutListeners.delete(cb);
    },

    recovery() {
      return { active: recoveryActive, error: recoveryError };
    }
  };
}

let instance: RemoteAuth | null | undefined;
let override: RemoteAuth | null | undefined;

/** The shared backend, or null when it has not been configured (browser-only fallback). */
export function getRemote(): RemoteAuth | null {
  if (override !== undefined) return override;
  if (instance !== undefined) return instance;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    instance = null;
    if (typeof console !== 'undefined')
    console.warn(
      '[MOTECH] Shared accounts are NOT configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing). ' +
      'Accounts are stored in this browser only. See SETUP-SHARED-ACCOUNTS.md.'
    );
    return null;
  }
  instance = createSupabaseRemote(
    createClient(url, key, {
      auth: {
        persistSession: true, // stay signed in on this device
        autoRefreshToken: true,
        detectSessionInUrl: true, // reads the password-reset link
        storageKey: 'motech.auth.v1'
      }
    })
  );
  return instance;
}

/** Test hook: inject a fake backend (pass undefined to restore normal behaviour). */
export function __setRemoteForTests(r: RemoteAuth | null | undefined): void {
  override = r;
}
