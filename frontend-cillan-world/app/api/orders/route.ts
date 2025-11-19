import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

type OrderProduct = { id: number; quantity?: number; size?: string; color?: string };
type OrderPayload = { products: OrderProduct[] };

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const ORDER_ALLOWED_ORIGINS = (process.env.ORDER_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ORDER_RATE_LIMIT = Number(process.env.ORDER_RATE_LIMIT ?? 10); // default 10 requests
const ORDER_RATE_WINDOW_MS = Number(
  process.env.ORDER_RATE_WINDOW_MS ?? 10 * 60 * 1000
); // default 10 minutes
const ORDER_SESSION_COOKIE = "cw_order_session";

type RateBucket = { count: number; start: number };

declare global {
  // eslint-disable-next-line no-var
  var __orderRateLimiter: Map<string, RateBucket> | undefined;
}

const rateStore =
  globalThis.__orderRateLimiter ?? new Map<string, RateBucket>();
globalThis.__orderRateLimiter = rateStore;

function isRateLimited(id: string) {
  if (!ORDER_RATE_LIMIT || ORDER_RATE_LIMIT <= 0) return false;
  const now = Date.now();
  const entry = rateStore.get(id);
  if (!entry || now - entry.start > ORDER_RATE_WINDOW_MS) {
    rateStore.set(id, { count: 1, start: now });
    return false;
  }
  if (entry.count >= ORDER_RATE_LIMIT) {
    return true;
  }
  entry.count += 1;
  return false;
}

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

  const origin = request.headers.get("origin") || "";
  if (
    ORDER_ALLOWED_ORIGINS.length > 0 &&
    origin &&
    !ORDER_ALLOWED_ORIGINS.includes(origin)
  ) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403 }
    );
  }

  const cookieStore = cookies();
  let sessionId = cookieStore.get(ORDER_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(ORDER_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  const forwardedFor =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const limiterKey = `${clientIp}:${sessionId}`;

  if (isRateLimited(limiterKey)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment." },
      { status: 429 }
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
