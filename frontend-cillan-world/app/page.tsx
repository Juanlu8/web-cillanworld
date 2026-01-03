import { Suspense } from 'react';
import { getFeaturedProducts, getHomeImages } from '@/lib/strapi-server';
import FullScreenScroll from "@/components/FullScreenScroll";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import Footer from "@/components/Footer";
import NextImage from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cillan World",
  description: "Designer apparel and exclusive collections from Cillan World.",
};

export default async function HomePage() {
  // ✅ Fetch datos en el servidor (en paralelo)
  const [featuredProductsResponse, homeImagesResponse] = await Promise.all([
    getFeaturedProducts(),
    getHomeImages(),
  ]);

  const featuredProducts = featuredProductsResponse.data || [];
  const homeImages = homeImagesResponse.data || null;

  return (
    <main className="relative">
      <section className="absolute top-0 left-0 z-[12] w-full px-6 pt-6 text-center text-white pointer-events-none">
        <h1 style={{ visibility: "hidden" }} className="text-xl font-semibold tracking-wide">Cillan World</h1>
        <p style={{ visibility: "hidden" }} className="mt-2 text-sm text-white/80">
          Designer apparel and exclusive collections from Cillan World.
        </p>
      </section>
      <NextImage
        src="/images/white-logo-cillan.webp"
        alt="Marca de agua"
        width={1600}
        height={900}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 w-[41rem] sm:w-[46rem] md:w-[56rem] lg:w-[61rem] pointer-events-none select-none z-[11]"
      />
      
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
        {/* ✅ Pasar datos del servidor a los componentes */}
        <FullScreenScroll initialImages={homeImages} />
        <HighlightsCarousel initialProducts={featuredProducts} />
        <Footer />
      </Suspense>
    </main>
  );
}
