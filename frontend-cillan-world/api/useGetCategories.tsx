import { useEffect, useState } from "react";
import { fetchFromApi } from "@/lib/api";
import { CategoryType, normalizeCategory } from "@/types/category";

export function useGetCategories() {
  const [result, setResult] = useState<CategoryType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const json = await fetchFromApi<{ data: any[] }>(
          "/api/categories?pagination[limit]=50",
          { signal: controller.signal }
        );
        setResult((json.data ?? []).map(normalizeCategory));
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
