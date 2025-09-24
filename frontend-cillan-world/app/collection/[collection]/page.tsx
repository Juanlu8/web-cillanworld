import type { Metadata } from "next";

// -------- Helpers ------------------------------------------------------------

type StrapiImage = { attributes?: { url?: string } };
type StrapiCollection = {
  id: number | string;
  attributes: {
    slug: string;
    collectionName?: string;
    description?: string;
    description_en?: string;
    images?: { data?: StrapiImage[] };
  };
};

function absUrl(path?: string, apiBase?: string) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (!apiBase) return path;
  return `${apiBase}${path}`;
}

async function fetchCollectionBySlug(slug: string) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.STRAPI_URL ??
    process.env.API_URL ??
    "";
  if (!apiBase) return null;

  const url =
    `${apiBase}/api/collections` +
    `?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&populate[images][fields][0]=url` +
    `&fields[0]=collectionName&fields[1]=description&fields[2]=description_en&fields[3]=slug`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const item: StrapiCollection | undefined = json?.data?.[0];
    if (!item) return null;

    const imgUrl = absUrl(item.attributes.images?.data?.[0]?.attributes?.url, apiBase);
    return { apiBase, item, imgUrl };
  } catch {
    return null;
  }
}

// -------- generateMetadata (Next 15: params como Promise) --------------------

export async function generateMetadata(
  { params }: { params: Promise<{ collection: string }> }
): Promise<Metadata> {
  const { collection } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cillanworld.com";

  const data = await fetchCollectionBySlug(collection);

  const rawTitle =
    data?.item?.attributes?.collectionName ??
    (collection || "Colección");

  const title = `${rawTitle} | Cillán World`;

  const description =
    (data?.item?.attributes?.description ?? "").slice(0, 160) ||
    "Explora las colecciones de Cillán World.";

  const canonical = `${siteUrl}/collection/${collection}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
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
      images: data?.imgUrl ? [data?.imgUrl] : undefined,
    },
  };
}

import CollectionPageClient from "./CollectionPageClient";

// -------- Page (Next 15: params como Promise) --------------------------------

export default async function Page(
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  return <CollectionPageClient slug={collection} />;
}
