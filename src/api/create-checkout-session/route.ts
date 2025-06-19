import { type NextRequest, NextResponse } from "next/server";
import { stripe, PREMIUM_PRICE_ID } from "@lib/stripe";
import { createServerClient } from "@lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: userId,
        },
      });

      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        user_id: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
