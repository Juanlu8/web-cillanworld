import type { MetadataRoute } from "next";
import {
  getCategories,
  getCollections,
  getProducts,
} from "@/lib/strapi-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cillan.world";

function buildUrl(path: string) {
  return `${siteUrl}${path}`;
}

function getLastModified(item: any): Date {
  const updated = item?.attributes?.updatedAt || item?.updatedAt;
  return updated ? new Date(updated) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsResponse, categoriesResponse, collectionsResponse] =
    await Promise.all([getProducts(), getCategories(), getCollections()]);

  const products = productsResponse?.data ?? [];
  const categories = categoriesResponse?.data ?? [];
  const collections = collectionsResponse?.data ?? [];

  const entries: MetadataRoute.Sitemap = [
    {
      url: buildUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildUrl("/catalog/view-all"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  categories.forEach((category: any) => {
    const slug = category?.attributes?.slug || category?.slug;
    if (!slug) return;
    entries.push({
      url: buildUrl(`/catalog/${slug}`),
      lastModified: getLastModified(category),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  collections.forEach((collection: any) => {
    const slug = collection?.attributes?.slug || collection?.slug;
    if (!slug) return;
    entries.push({
      url: buildUrl(`/collection/${slug}`),
      lastModified: getLastModified(collection),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  products.forEach((product: any) => {
    const slug = product?.attributes?.slug || product?.slug;
    if (!slug) return;
    entries.push({
      url: buildUrl(`/product/${slug}`),
      lastModified: getLastModified(product),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  return entries;
}
