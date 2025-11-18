// app/catalog/[category]/page.tsx
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/strapi-server';
import CatalogClient from './CatalogClient';
import type { Metadata } from 'next';

type Params = { category?: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { category } = await params;
  const title = category 
    ? `${category} - Catálogo | Cillán World`
    : 'Catálogo | Cillán World';

  return {
    title,
    description: 'Discover our full catalog of designer apparel.',
  };
}

// ✅ Generar rutas estáticas para categorías
export async function generateStaticParams() {
  const response = await getCategories();
  const categories = response.data || [];

  return categories.map((cat: any) => ({
    category: cat.attributes?.slug || '',
  }));
}

// ✅ Server Component
export default async function CatalogPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;

  // Fetch productos con filtro opcional de categoría
  const filters = category && category !== 'view-all'
    ? { category: { slug: { $eq: category } } }
    : {};

  const productsResponse = await getProducts(filters);
  const categoriesResponse = await getCategories();

  return (
    <Suspense fallback={<div>Loading catalog...</div>}>
      <CatalogClient 
        initialProducts={productsResponse.data || []}
        categories={categoriesResponse.data || []}
        initialCategory={category || null}
      />
    </Suspense>
  );
}