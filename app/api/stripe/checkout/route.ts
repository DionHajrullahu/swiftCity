import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const { type, city, email } = body;

    // type = 'city_plan' | 'subscription'
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swiftcity.xyz";

    if (type === "city_plan") {
      // One-time purchase — $4.99 per city
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 499, // $4.99
              product_data: {
                name: `SwiftCity ${city} Local Plan`,
                description: `3-day curated itinerary for ${city} — built by verified locals`,
                images: ["https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80"],
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          purchase_type: "city_plan",
          city: city ?? "",
        },
        success_url: `${origin}/city/${encodeURIComponent(city)}/plan?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/city/${encodeURIComponent(city)}`,
      });

      return NextResponse.json({ url: session.url });

    } else if (type === "subscription") {
      // Monthly subscription — $9.99/month, all cities
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 999, // $9.99/month
              recurring: { interval: "month" },
              product_data: {
                name: "SwiftCity All-Access",
                description: "Unlimited curated local plans for all cities — new cities added monthly",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          purchase_type: "subscription",
        },
        success_url: `${origin}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/plans`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid purchase type." }, { status: 400 });

  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}