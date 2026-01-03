import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/strapi-server";
import CatalogClient from "./CatalogClient";
import type { Metadata } from "next";

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
  const categories = categoriesResponse?.data ?? [];
  const match = categories.find(
    (cat: any) => (cat?.attributes?.slug || cat?.slug) === category
  );

  const categoryName =
    match?.attributes?.categoryName || match?.categoryName || category;
  const description =
    match?.attributes?.description || match?.description || fallbackDescription;
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
  const categories = response.data || [];

  return categories.map((cat: any) => ({
    category: cat.attributes?.slug || "",
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
        categories={categoriesResponse.data || []}
        initialCategory={category || null}
      />
    </Suspense>
  );
}
