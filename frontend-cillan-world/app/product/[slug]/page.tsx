// app/product/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/strapi-server';
import ProductPageClient from './ProductPageClient';
import type { Metadata } from 'next';

type Params = { slug: string };

// ✅ Generar metadata en el servidor
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const title = product.attributes?.productName || 'Product';
  const description = product.attributes?.details || '';
  const imageUrl = product.attributes?.images?.data?.[0]?.attributes?.url;

  return {
    title: `${title} | Cillán World`,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

// ✅ Generar rutas estáticas en build time
export async function generateStaticParams() {
  const response = await getProducts();
  const products = response.data || [];

  return products.map((product: any) => ({
    slug: product.attributes?.slug || '',
  }));
}

// ✅ Server Component - fetch en servidor
export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  
  // Fetch en servidor (HTML pre-renderizado)
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch productos relacionados (mismo servidor)
  const allProducts = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {/* ✅ Pasar datos al Client Component */}
      <ProductPageClient 
        initialProduct={product}
        allProducts={allProducts.data || []}
      />
    </Suspense>
  );
}