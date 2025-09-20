import { useEffect, useState } from "react";
import { fetchFromApi } from "@/lib/api";
import { HomeImageType } from "@/types/homeImage";

export function useGetHomeImages() {
  const [result, setResult] = useState<HomeImageType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const json = await fetchFromApi<{ data: HomeImageType[] }>(
          "/api/home-images?populate=*",
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