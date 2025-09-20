import { useEffect, useState } from "react";
import { ProductType } from "@/types/product";
import { fetchFromApi } from "@/lib/api";

export function useGetProducts() {
  const [result, setResult] = useState<ProductType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const json = await fetchFromApi<{ data: ProductType[] }>(
          "/api/products?populate=*",
          { signal: controller.signal }
        );
        setResult(json.data);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return { loading, result, error };
}