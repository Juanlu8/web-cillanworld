"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProducts } from "@/api/useGetProducts";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { ProductType } from "@/types/product";
import { useRouter, useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function CatalogPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Restaurar scroll al entrar
  useEffect(() => {
    const scrollY = sessionStorage.getItem("catalogScroll");
    if (scrollY) window.scrollTo(0, Number(scrollY));
  }, []);

  // Guardar scroll al salir
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem("catalogScroll", String(window.scrollY));
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, []);

  const { category } = useParams<{ category: string }>();

  const goToHome = () => router.push(`/`);

  // Resultado estable de productos
  const { result } = useGetProducts();
  const products: ProductType[] = useMemo(
    () => (Array.isArray(result) ? result : []),
    [result]
  );

  // Mantén el estado sincronizado con la URL
  const [activeCategory, setActiveCategory] = useState<string | null>(category || null);
  useEffect(() => {
    setActiveCategory(category || null);
  }, [category]);

  // Orden por 'order'
  const orderedResult = useMemo(() => {
    return products
      .slice()
      .sort((a, b) => {
        const orderA = a.attributes.order;
        const orderB = b.attributes.order;
        if (orderA == null && orderB == null) return 0;
        if (orderA == null) return 1;
        if (orderB == null) return -1;
        return orderA - orderB;
      });
  }, [products]);

  // Filtro por categoría
  const filteredProducts = useMemo(() => {
    if (!activeCategory || activeCategory === "view-all") return orderedResult;
    return orderedResult.filter((product) => {
      const cats = product.attributes.categories?.data ?? [];
      return cats.some((c) => c.attributes.slug === activeCategory);
    });
  }, [orderedResult, activeCategory]);

  // Título (cálculo directo, sin useMemo)
  const pageTitle =
    !activeCategory || activeCategory === "view-all"
      ? t("general.all_catalogue").toUpperCase()
      : activeCategory === "tops"
      ? t("navbar.tops").toUpperCase()
      : activeCategory === "bottoms"
      ? t("navbar.bottoms").toUpperCase()
      : activeCategory === "runaway-pieces"
      ? t("navbar.runaway_pieces").toUpperCase()
      : t("general.all_catalogue").toUpperCase();

  return (
    <div className="relative">
      {/* Fondo decorativo anilla */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image
          src="/images/anilla.webp"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-42"
          priority={false}
        />
      </div>

      {/* Marca de agua */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-0">
        <Image
          src="/images/logo-top.webp"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
          onClick={goToHome}
          priority
        />
      </div>

      <div className="z-0">
        <NavBar />
      </div>

      <div className="px-4 md:px-10 py-12 md:py-24">
        <h1 className="text-2xl mb-4 tracking-wide">{pageTitle}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}