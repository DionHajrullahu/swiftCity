import { createClient } from "@supabase/supabase-js";

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

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});