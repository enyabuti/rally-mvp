import { createClient } from '@supabase/supabase-js';

// ─── Browser Client (uses anon key, respects RLS) ────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Server Client (uses service role key, bypasses RLS) ──
// Only use in API routes, never expose to the browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
