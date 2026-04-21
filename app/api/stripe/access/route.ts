import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  const city = searchParams.get("city");

  if (!email) return NextResponse.json({ hasAccess: false });

  const supabase = getAdmin();

  // Check for active subscription (all-access)
  const { data: subscription } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_email", email)
    .eq("purchase_type", "subscription")
    .eq("status", "completed")
    .limit(1)
    .single();

  if (subscription) return NextResponse.json({ hasAccess: true, type: "subscription" });

  // Check for city-specific purchase
  if (city) {
    const { data: cityPlan } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_email", email)
      .eq("purchase_type", "city_plan")
      .ilike("city", city)
      .eq("status", "completed")
      .limit(1)
      .single();

    if (cityPlan) return NextResponse.json({ hasAccess: true, type: "city_plan" });
  }

  return NextResponse.json({ hasAccess: false });
}