import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/strapi-server";
import ProductPageClient from "./ProductPageClient";
import type { Metadata } from "next";
import type { ProductType } from "@/types/product";
import { getProductImageUrls } from "@/lib/product-images";

type Params = { slug: string };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cillan.world";

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.attributes?.productName || "Product";
  const description = product.attributes?.details || "";
  const imageUrl = getProductImageUrls(product as ProductType)[0];
  const canonical = `${siteUrl}/product/${slug}`;

  return {
    title: `${title} | Cillan World`,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      type: "product",
      url: canonical,
      siteName: "Cillan World",
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  const response = await getProducts();
  const products = response.data || [];

  return products.map((product: any) => ({
    slug: product.attributes?.slug || "",
  }));
}

export default async function ProductPage({
  params,
}: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const imageUrls = getProductImageUrls(product as ProductType);
  const { price, active, productName, details, details_en } =
    product.attributes || {};
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName || "Product",
    image: imageUrls,
    description: details || details_en || "",
    brand: { "@type": "Brand", name: "Cillan World" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: price ?? 0,
      availability: active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Cargando...
          </div>
        }
      >
        <ProductPageClient
          initialProduct={product}
          allProducts={allProducts.data || []}
        />
      </Suspense>
    </>
  );
}
