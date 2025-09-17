/**import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here };*/


//export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite imágenes externas desde Strapi
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "https",
        hostname: "tu-dominio-strapi.com", // ← cambia esto en producción
      },
    ],
  },

  // Cabeceras de seguridad básicas
  async headers() {
    return [
      {
        source: "/(.*)", // aplica a todas las rutas
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;