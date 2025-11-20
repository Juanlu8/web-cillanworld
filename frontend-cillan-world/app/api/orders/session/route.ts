import { NextResponse } from "next/server";

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_KEY ||
  process.env.STRIPE_SECRET ||
  null;

const API_VERSION = "2024-06-20";

export async function GET(request: Request) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe secret key not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionId =
    searchParams.get("session_id") ?? searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id parameter" },
      { status: 400 },
    );
  }

  try {
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(
        sessionId,
      )}?expand[]=payment_intent&expand[]=customer`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Stripe-Version": API_VERSION,
        },
        cache: "no-store",
      },
    );

    const payload = await stripeResponse.json();

    if (!stripeResponse.ok) {
      const message =
        (payload && typeof payload === "object" && "error" in payload
          ? (payload.error as { message?: string }).message
          : null) || "Unable to retrieve session";

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const paymentIntent =
      payload.payment_intent && typeof payload.payment_intent === "object"
        ? payload.payment_intent
        : null;

    return NextResponse.json({
      id: payload.id,
      status: payload.status,
      paymentStatus: payload.payment_status,
      amountTotal: payload.amount_total,
      currency: payload.currency,
      url: payload.url,
      customerEmail:
        payload.customer_details?.email ||
        (typeof payload.customer === "object"
          ? payload.customer.email ?? undefined
          : undefined),
      customerName: payload.customer_details?.name ?? undefined,
      paymentIntentStatus: paymentIntent?.status ?? null,
      paymentIntentId: paymentIntent?.id ?? null,
      expiresAt: payload.expires_at,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve session";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
