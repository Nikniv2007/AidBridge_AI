/**
 * Supabase client scaffolding.
 *
 * The app currently runs entirely on the in-memory mock store (`lib/data`), so
 * this module is intentionally a thin, dependency-free stub that documents the
 * intended integration surface. When `@supabase/supabase-js` is installed and
 * env vars are set, swap the `createClient` stub for the real client and point
 * the data adapters at Postgres.
 *
 * TODO(supabase): install @supabase/supabase-js, wire Auth + RLS, and implement
 * the adapters in `lib/supabase/adapters.ts` against `supabase/schema.sql`.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Placeholder factory. Returns null until Supabase is configured & installed.
 * Callers must handle the null case by falling back to the mock store.
 */
export function createClient(): null {
  // Intentionally not throwing: absence of Supabase is a supported mode.
  return null;
}
