import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q) return NextResponse.json({ results: [] });

  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("approved", true)
    .or(
      `city.ilike.%${q}%,name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%,tips.ilike.%${q}%`
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ results: data });
}
