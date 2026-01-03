// app/collection/[collection]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCollectionBySlug, getCollections } from '@/lib/strapi-server';
import CollectionPageClient from './CollectionPageClient';
import type { Metadata } from "next";

type Params = { collection: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  const attributes = collection.attributes ?? collection;
  const name = attributes.collectionName || slug;
  const description =
    attributes.description || attributes.description_en || "";

  return {
    title: `${name} | Cillan World`,
    description,
    alternates: {
      canonical: `/collection/${slug}`,
    },
    openGraph: {
      title: name,
      description,
    },
  };
}

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CollectionPageClient collection={collection} />
    </Suspense>
  );
}
