import { useEffect, useState } from "react";
import { fetchFromApi } from "@/lib/api";
import { ProductType } from "@/types/product";

export function useGetFeaturedProducts() {
  const [result, setResult] = useState<ProductType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const json = await fetchFromApi<{ data: ProductType[] }>(
          "/api/products?filters[isFeatured][$eq]=true&populate=*",
          { signal: controller.signal }
        );
        setResult(json.data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return { loading, result, error };
}