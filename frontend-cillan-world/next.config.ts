import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactiva lint en el build; se puede ejecutar en CI por separado
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Permite imケgenes externas desde Strapi
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "tu-dominio-strapi.com", // cambia esto en producciИn
      },
      {
        protocol: "https",
        hostname: "web-cillanworld.onrender.com", // backend Strapi
      },
      {
        protocol: "https",
        hostname: "web-cillanworld.vercel.app", // si sirves imケgenes desde el front
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/catalog",
        destination: "/catalog/view-all",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/privacyPolicy",
        permanent: true,
      },
      {
        source: "/terms-conditions",
        destination: "/termsConditions",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/termsConditions",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
    ];
  },

  // Cabeceras de seguridad bケsicas
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
