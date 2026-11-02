/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://abcdxyz.supabase.co (shared accounts database). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase "anon" public key. Safe to ship in the browser; row-level security protects the data. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
