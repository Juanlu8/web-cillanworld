// app/catalog/[category]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import CatalogClient from "./CatalogClient";

type Params = { category?: string };

const TITLE_BASE = "Cillán World — Catalog";
const DESC_BASE =
  "Discover our full catalog of designer apparel: tops, bottoms and runway pieces. Limited drops, crafted details.";

function titleForCategory(slug?: string) {
  if (!slug || slug === "view-all") return `${TITLE_BASE} — All`;
  if (slug === "tops") return `${TITLE_BASE} — Tops`;
  if (slug === "bottoms") return `${TITLE_BASE} — Bottoms`;
  if (slug === "runaway-pieces") return `${TITLE_BASE} — Runway Pieces`;
  return TITLE_BASE;
}

function descriptionForCategory(slug?: string) {
  if (!slug || slug === "view-all") return DESC_BASE;
  if (slug === "tops") return "Shop all tops: tees, shirts and more.";
  if (slug === "bottoms") return "Shop all bottoms: trousers, skirts and more.";
  if (slug === "runaway-pieces") return "Exclusive runway pieces. Limited availability.";
  return DESC_BASE;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { category } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.cillan.world";
  const path = category ? `/catalog/${category}` : "/catalog";
  const url = new URL(path, baseUrl).toString();

  const title = titleForCategory(category);
  const description = descriptionForCategory(category);

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Cillán World",
      images: [{ url: "/og/catalog.jpg", width: 1200, height: 630, alt: "Cillán World — Catalog" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  return <CatalogClient initialCategory={category ?? null} />;
}
