import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Category = "restaurant" | "activity" | "hidden_gem";

export type Recommendation = {
  id: string;
  created_at: string;
  reviewer_id: string;
  city: string;
  country: string;
  category: Category;
  name: string;
  description: string;
  address: string;
  tips: string;
  approved: boolean;
};

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During Next.js build these won't exist — that's fine, the client
  // is never actually CALLED during build, only during runtime.
  // We create with empty strings here purely to satisfy the type —
  // any real call at runtime will use the real env vars baked in by Vercel.
  _supabase = createClient(url ?? "", key ?? "", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
