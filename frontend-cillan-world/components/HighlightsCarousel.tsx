"use client";

import { useMemo, useState, useEffect } from "react";
import { ProductType } from "@/types/product";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import ProductCard from "./ProductCard";

// ✅ Definir el tipo de las props
type Props = {
  initialProducts: ProductType[];
};

// ✅ Actualizar la función para recibir props del servidor
export default function HighlightsCarousel({ initialProducts }: Props) {
  const { t } = useTranslation();
  
  // ❌ ELIMINADO: const { data: featuredProducts } = useGetFeaturedProducts();
  
  // ✅ Usar los datos que vienen del servidor
  const products = useMemo(() => {
    if (!initialProducts) return [];
    
    // Si viene como { data: [...] }
    if (Array.isArray(initialProducts)) return initialProducts;
    
    return [];
  }, [initialProducts]);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    const handleChange = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };
    
    api.on("select", handleChange);
    handleChange(); // Sincronizar estado inicial
    
    return () => {
      api.off?.("select", handleChange);
    };
  }, [api]);

  // Ordenar por campo `order` (nulls last)
  const orderedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const orderA = a?.attributes?.order ?? null;
      const orderB = b?.attributes?.order ?? null;
      if (orderA == null && orderB == null) return 0;
      if (orderA == null) return 1;
      if (orderB == null) return -1;
      return orderA - orderB;
    });
  }, [products]);

  if (!orderedProducts || orderedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-24 px-4 md:px-10 bg-white">
      <h2 className="text-2xl font-bold mb-8 tracking-wide">
        {t("general.highlights").toUpperCase()}
      </h2>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {orderedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots de navegación */}
      <div className="flex justify-center gap-2 mt-6">
        {orderedProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-black scale-125" : "bg-gray-300"
            }`}
            aria-label={`Ir a producto ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}