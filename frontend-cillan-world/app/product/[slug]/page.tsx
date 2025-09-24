import type { Metadata } from "next";

/* helpers iguales (fetchProductBySlug, absUrl, etc.) */

async function fetchProductBySlug(slug: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.STRAPI_URL ??
    process.env.API_URL ??
    "";
  if (!apiBase) return null;

  const url =
    `${apiBase}/api/products` +
    `?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&populate[images][fields][0]=url`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.data?.[0];
    if (!item) return null;

    const imgPath = item?.attributes?.images?.data?.[0]?.attributes?.url;
    const imgUrl =
      typeof imgPath === "string"
        ? (imgPath.startsWith("http") ? imgPath : `${apiBase}${imgPath}`)
        : undefined;

    return { item, imgUrl };
  } catch {
    return null;
  }
}

// ✅ params como Promise y función async
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cillanworld.com";
  const data = await fetchProductBySlug(slug);

  const title = data?.item
    ? `${data.item.attributes.productName} | Cillán World`
    : `Producto | Cillán World`;

  const description =
    data?.item?.attributes?.details?.slice(0, 160) ??
    "Descubre las prendas de Cillán World.";

  const canonical = `${siteUrl}/product/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website", // ← no "product" en tipos de Next
      url: canonical,
      siteName: "Cillán World",
      title,
      description,
      images: data?.imgUrl ? [{ url: data.imgUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: data?.imgUrl ? [data.imgUrl] : undefined,
    },
  };
}

import ProductPageClient from "./ProductPageClient";

// ✅ params como Promise y función async
export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
