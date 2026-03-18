import { createBrowserClient } from '@supabase/ssr'

// Safe fallbacks so `next build` works without a .env.local file.
// Real values must be set in .env.local for the app to actually function.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

// Call this in Client Components only
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
