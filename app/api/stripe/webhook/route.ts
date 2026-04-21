import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = getAdmin();

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle both one-time payments and subscriptions
  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    const email =
      session.customer_email ??
      session.customer_details?.email ??
      "";

    const purchaseType =
      (session.metadata?.purchase_type as string) ??
      (session.mode === "subscription" ? "subscription" : "city_plan");

    const city = session.metadata?.city ?? null;

    await supabase.from("purchases").upsert({
      stripe_session_id: session.id,
      user_email: email,
      stripe_customer_id: session.customer as string ?? null,
      purchase_type: purchaseType,
      city: city,
      status: "completed",
    }, { onConflict: "stripe_session_id" });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabase
      .from("purchases")
      .update({ status: "cancelled" })
      .eq("stripe_customer_id", sub.customer as string)
      .eq("purchase_type", "subscription");
  }

  return NextResponse.json({ received: true });
}