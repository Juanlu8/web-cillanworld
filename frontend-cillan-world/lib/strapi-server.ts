// lib/strapi-server.ts
import qs from 'qs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_SERVER_TOKEN =
  process.env.STRAPI_SERVER_API_TOKEN ||
  process.env.STRAPI_READ_API_TOKEN ||
  process.env.STRAPI_SERVER_TOKEN ||
  undefined;

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
  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (STRAPI_SERVER_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_SERVER_TOKEN}`;
  }

  try {
    const res = await fetch(url, {
      headers,
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

const PRODUCT_POPULATE = ['images', 'categories'];

export async function getProducts(filters?: Record<string, any>) {
  const query = qs.stringify(
    {
      populate: PRODUCT_POPULATE,
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
      populate: PRODUCT_POPULATE,
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
      populate: PRODUCT_POPULATE,
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
      populate: ['images'],
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
      populate: ['images'],
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
