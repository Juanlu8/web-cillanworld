// src/lib/api.ts
export const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337"; // fallback opcional

export async function fetchFromApi<T>(endpoint: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  const res = await fetch(`${BASE_URL}${endpoint}`, init);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}