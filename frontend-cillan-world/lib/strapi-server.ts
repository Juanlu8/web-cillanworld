// lib/strapi-server.ts
import qs from 'qs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

type FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

async function fetchStrapi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags = [] } = options;
  const url = `${STRAPI_URL}/api${path}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate,
        tags,
      },
    });

    if (!res.ok) {
      throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export async function getProducts(filters?: Record<string, any>) {
  const query = qs.stringify(
    {
      populate: ['images', 'category'],
      filters: filters || {},
      pagination: { limit: 100 },
    },
    { encodeValuesOnly: true }
  );

  return fetchStrapi<any>(`/products?${query}`, {
    revalidate: 3600,
    tags: ['products'],
  });
}

export async function getProductBySlug(slug: string) {
  const query = qs.stringify(
    {
      populate: ['images', 'category'],
      filters: { slug: { $eq: slug } },
    },
    { encodeValuesOnly: true }
  );

  const response = await fetchStrapi<any>(`/products?${query}`, {
    revalidate: 3600,
    tags: ['products', `product-${slug}`],
  });

  return response.data?.[0] || null;
}

export async function getFeaturedProducts() {
  const query = qs.stringify(
    {
      populate: ['images', 'category'],
      filters: { isFeatured: { $eq: true } },
      pagination: { limit: 10 },
    },
    { encodeValuesOnly: true }
  );

  return fetchStrapi<any>(`/products?${query}`, {
    revalidate: 1800,
    tags: ['products', 'isFeatured'],
  });
}

export async function getCollections() {
  const query = qs.stringify(
    {
      populate: ['image'],
      pagination: { limit: 50 },
    },
    { encodeValuesOnly: true }
  );

  return fetchStrapi<any>(`/collections?${query}`, {
    revalidate: 3600,
    tags: ['collections'],
  });
}

export async function getCollectionBySlug(slug: string) {
  const query = qs.stringify(
    {
      populate: ['image', 'products.images'],
      filters: { slug: { $eq: slug } },
    },
    { encodeValuesOnly: true }
  );

  const response = await fetchStrapi<any>(`/collections?${query}`, {
    revalidate: 3600,
    tags: ['collections', `collection-${slug}`],
  });

  return response.data?.[0] || null;
}

/**
 * Obtener imágenes del home
 */
export async function getHomeImages() {
  // ✅ CORREGIDO: home-images (plural)
  return fetchStrapi<any>('/home-images?populate=*', {
    revalidate: 1800,
    tags: ['home'],
  });
}

export async function getCategories() {
  return fetchStrapi<any>('/categories?pagination[limit]=50', {
    revalidate: 3600,
    tags: ['categories'],
  });
}