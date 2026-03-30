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

// Singleton instance
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy during SSR/build — never called in browser if env vars set
    _supabase = createClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
    );
    return _supabase;
  }

  _supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _supabase;
}

// Named export so existing imports work unchanged
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
