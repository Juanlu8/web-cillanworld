import { NextResponse } from "next/server";

type OrderProduct = { id: number; quantity?: number };
type OrderPayload = { products: OrderProduct[] };

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function POST(request: Request) {
  if (!STRAPI_URL) {
    return NextResponse.json(
      { error: "Strapi URL not configured" },
      { status: 500 }
    );
  }

  if (!STRAPI_API_TOKEN) {
    return NextResponse.json(
      { error: "Strapi API token not configured" },
      { status: 500 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Order payload must be an object" },
      { status: 400 }
    );
  }

  const orderPayload =
    "data" in (payload as Record<string, unknown>)
      ? ((payload as { data: unknown }).data as OrderPayload)
      : (payload as OrderPayload);

  if (!orderPayload || typeof orderPayload !== "object") {
    return NextResponse.json(
      { error: "Order payload must be an object" },
      { status: 400 }
    );
  }

  if (!Array.isArray(orderPayload.products) || orderPayload.products.length === 0) {
    return NextResponse.json(
      { error: "Order must include at least one product" },
      { status: 400 }
    );
  }

  const invalidProduct = orderPayload.products.find(
    (item) => typeof item !== "object" || typeof item.id !== "number"
  );

  if (invalidProduct) {
    return NextResponse.json(
      { error: "Each product must include a numeric id" },
      { status: 400 }
    );
  }

  try {
    const strapiOrdersUrl = `${STRAPI_URL.replace(/\/$/, "")}/api/orders`;

    const response = await fetch(strapiOrdersUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ data: orderPayload }),
    });

    let data: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage =
        (data as { error?: string | { message?: string } })?.error ??
        (typeof data === "object" && data && "message" in data
          ? (data as { message?: string }).message
          : null);

      return NextResponse.json(
        { error: errorMessage || "Failed to create order" },
        { status: response.status }
      );
    }

    const normalizedData =
      data && typeof data === "object" && "data" in (data as Record<string, unknown>)
        ? (data as { data: unknown }).data
        : data;

    return NextResponse.json(normalizedData ?? {});
  } catch (error) {
    console.error("[orders] Failed to reach Strapi:", error);
    return NextResponse.json(
      { error: "Failed to reach Strapi" },
      { status: 502 }
    );
  }
}
