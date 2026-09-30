import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/strapi-server";
import CatalogClient from "./CatalogClient";
import type { Metadata } from "next";
import { normalizeCategory, type CategoryType } from "@/types/category";

type Params = { category?: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params;
  const isAll = !category || category === "view-all";
  const fallbackDescription = "Discover our full catalog of designer apparel.";

  if (isAll) {
    return {
      title: "Catalogo | Cillan World",
      description: fallbackDescription,
      alternates: {
        canonical: "/catalog/view-all",
      },
      openGraph: {
        title: "Catalogo | Cillan World",
        description: fallbackDescription,
      },
    };
  }

  const categoriesResponse = await getCategories();
  const categories = (categoriesResponse?.data ?? []).map(normalizeCategory);
  const match = categories.find((cat: CategoryType) => cat.slug === category);

  const categoryName = match?.categoryName || category;
  const description = fallbackDescription;
  const title = `${categoryName} - Catalogo | Cillan World`;

  return {
    title,
    description,
    alternates: {
      canonical: `/catalog/${category}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const response = await getCategories();
  const categories = (response.data || []).map(normalizeCategory);

  return categories.map((cat: CategoryType) => ({
    category: cat.slug || "",
  }));
}

export default async function CatalogPage({
  params,
}: { params: Promise<Params> }) {
  const { category } = await params;

  const filters =
    category && category !== "view-all"
      ? { categories: { slug: { $eq: category } } }
      : {};

  const productsResponse = await getProducts(filters);
  const categoriesResponse = await getCategories();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <CatalogClient
        initialProducts={productsResponse.data || []}
        categories={(categoriesResponse.data || []).map(normalizeCategory)}
        initialCategory={category || null}
      />
    </Suspense>
  );
}
