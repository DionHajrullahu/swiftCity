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
  media_urls?: string[];
};

// Only create the client in the browser where env vars are guaranteed
// to be baked in. During SSR/build, return a no-op proxy so nothing crashes.
let _client: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || "";
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    // SSR / build time — return a dummy that never gets called
    return createClient("https://dummy.supabase.co", "dummy-key-for-build-only");
  }

  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export function getSupabase(): SupabaseClient {
  if (!_client) _client = createSupabaseClient();
  return _client;
}

// Every file that imports `supabase` directly keeps working
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabase() as any)[prop]; },
});