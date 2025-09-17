"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProducts } from "@/api/useGetProducts";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { ProductType } from "@/types/product";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "react-i18next";
import NextImage from "next/image";

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

  const searchParams = useSearchParams();
  const categoryFromURL = searchParams.get("category");

  const goToHome = () => router.push(`/`);

  const result: ProductType[] = useGetProducts().result ?? [];

  // Mantén el estado sincronizado con la URL
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryFromURL);
  useEffect(() => {
    setActiveCategory(categoryFromURL);
  }, [categoryFromURL]);

  // Orden por 'order'
  const orderedResult = useMemo(() => {
    return [...result].sort((a, b) => {
      const orderA = a.attributes.order;
      const orderB = b.attributes.order;
      if (orderA == null && orderB == null) return 0;
      if (orderA == null) return 1;
      if (orderB == null) return -1;
      return orderA - orderB;
    });
  }, [result]);

  // Filtro por slug usando **categories** (array)
  const filteredProducts = useMemo(() => {
    if (!activeCategory || activeCategory === "view-all") return orderedResult;

    return orderedResult.filter((product) => {
      const cats = product.attributes.categories?.data ?? [];
      return cats.some((c) => c.attributes.slug === activeCategory);
    });
  }, [orderedResult, activeCategory]);

  // Título por categoría seleccionada
  const pageTitle = useMemo(() => {
    if (!activeCategory || activeCategory === "view-all")
      return t("general.all_catalogue").toUpperCase();
    if (activeCategory === "tops") return t("navbar.tops").toUpperCase();
    if (activeCategory === "bottoms") return t("navbar.bottoms").toUpperCase();
    if (activeCategory === "runaway-pieces")
      return t("navbar.runaway_pieces").toUpperCase();
    // fallback
    return t("general.all_catalogue").toUpperCase();
  }, [activeCategory, t]);

  return (
    <div className="relative">
      {/* Fondo decorativo anilla */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <NextImage
          src="/images/anilla.png"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-42"
        />
      </div>

      {/* Marca de agua */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-00">
        <NextImage
          src="/images/logo-top.png"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={goToHome}
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