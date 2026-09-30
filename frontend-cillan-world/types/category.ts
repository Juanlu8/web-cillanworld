export type CategoryType = {
  id: number;
  categoryName: string;
  slug: string;
  order?: number;
};

export function normalizeCategory(raw: any): CategoryType {
  const attrs = raw?.attributes ?? raw;
  return {
    id: raw.id,
    categoryName: attrs?.categoryName,
    slug: attrs?.slug,
    order: attrs?.order,
  };
}
