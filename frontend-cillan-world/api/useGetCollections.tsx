import { useEffect, useState } from "react";
import { fetchFromApi } from "@/lib/api";
import { CollectionType } from "@/types/collection";

export function useGetCollections() {
  const [result, setResult] = useState<CollectionType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const json = await fetchFromApi<{ data: CollectionType[] }>(
          "/api/collections?populate=*",
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