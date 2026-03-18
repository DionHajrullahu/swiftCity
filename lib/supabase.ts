import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
