import type { ProductType } from "@/types/product";
import { toMediaUrl } from "@/lib/media";

const splitUrls = (value: string) => value.split(/\s+/).filter(Boolean);

export const normalizeImageUrlField = (value?: string[] | string): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return splitUrls(value);
  return [];
};

export const getProductImageUrls = (product?: ProductType | null): string[] => {
  if (!product?.attributes) return [];
  return normalizeImageUrlField(product.attributes.imageUrl).map((url) => toMediaUrl(url));
};
