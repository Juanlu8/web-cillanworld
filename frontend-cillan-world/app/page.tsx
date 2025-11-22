import { Suspense } from 'react';
import { getFeaturedProducts, getHomeImages } from '@/lib/strapi-server';
import FullScreenScroll from "@/components/FullScreenScroll";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import Footer from "@/components/Footer";
import NextImage from "next/image";

export default async function HomePage() {
  // ✅ Fetch datos en el servidor (en paralelo)
  const [featuredProductsResponse, homeImagesResponse] = await Promise.all([
    getFeaturedProducts(),
    getHomeImages(),
  ]);

  const featuredProducts = featuredProductsResponse.data || [];
  const homeImages = homeImagesResponse.data || null;

  return (
    <main>
      <NextImage
        src="/images/white-logo-cillan.webp"
        alt="Marca de agua"
        width={1600}
        height={900}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 w-[41rem] sm:w-[46rem] md:w-[56rem] lg:w-[61rem] pointer-events-none select-none z-[11]"
        priority
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
