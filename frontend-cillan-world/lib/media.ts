// src/lib/media.ts
/**
 * Convierte rutas relativas (/uploads/...) a absolutas según NEXT_PUBLIC_BACKEND_URL.
 * Si ya es absoluta (http/https), la devuelve tal cual.
 */
export const toMediaUrl = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  if (!base) return path; // fallback "tal cual" si no hay base configurada

  try {
    return new URL(path, base).toString();
  } catch {
    // último recurso por si base viene sin protocolo o hay formatos raros
    const baseClean = base.replace(/\/$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${baseClean}${p}`;
  }
};