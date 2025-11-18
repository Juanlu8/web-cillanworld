// app/collection/[collection]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCollectionBySlug, getCollections } from '@/lib/strapi-server';
import CollectionPageClient from './CollectionPageClient';

type Params = { collection: string };

export async function generateStaticParams() {
  const response = await getCollections();
  const collections = response.data || [];

  return collections.map((col: any) => ({
    collection: col.attributes?.slug || '',
  }));
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { collection: slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading collection...</div>}>
      <CollectionPageClient collection={collection} />
    </Suspense>
  );
}