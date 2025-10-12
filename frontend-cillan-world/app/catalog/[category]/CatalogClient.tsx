"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetProducts } from "@/api/useGetProducts";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { ProductType } from "@/types/product";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "react-i18next";
import Image from "next/image";

type Props = {
  initialCategory: string | null;
};

// --- helpers ---------------------------------------------------------------

/** Devuelve el campo localizado: p.ej. productName / productName_en */
function getLocalized<T extends Record<string, any>>(
  obj: T | undefined,
  baseKey: string,
  lang: string
) {
  if (!obj) return undefined;
  const isEN = lang.toLowerCase().startsWith("en");
  const enKey = `${baseKey}_en`;
  return (isEN ? obj[enKey] : obj[baseKey]) ?? obj[baseKey] ?? obj[enKey];
}

/** Absolutiza una URL de Strapi si viene relativa */
function toAbsoluteMedia(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL ?? "";
  return `${base}${url}`;
}

export default function CatalogClient({ initialCategory }: Props) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // --- scroll restore/store -------------------------------------------------
  useEffect(() => {
    const scrollY = sessionStorage.getItem("catalogScroll");
    if (scrollY) window.scrollTo(0, Number(scrollY));
  }, []);

  useEffect(() => {
    const save = () => sessionStorage.setItem("catalogScroll", String(window.scrollY));
    window.addEventListener("beforeunload", save);
    const onVis = () => document.visibilityState === "hidden" && save();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // --- state synced with route param ---------------------------------------
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const goToHome = () => router.push(`/`);

  // --- data ----------------------------------------------------------------
  const { result } = useGetProducts();
  const products: ProductType[] = useMemo(
    () => (Array.isArray(result) ? result : []),
    [result]
  );

  // order by `attributes.order` (nulls last)
  const orderedResult = useMemo(() => {
    return products.slice().sort((a, b) => {
      const orderA = a?.attributes?.order ?? null;
      const orderB = b?.attributes?.order ?? null;
      if (orderA == null && orderB == null) return 0;
      if (orderA == null) return 1;
      if (orderB == null) return -1;
      return orderA - orderB;
    });
  }, [products]);

  // filter by category slug
  const filteredProducts = useMemo(() => {
    if (!activeCategory || activeCategory === "view-all") return orderedResult;
    return orderedResult.filter((product) => {
      const cats = product?.attributes?.categories?.data ?? [];
      return cats.some((c: any) => c?.attributes?.slug === activeCategory);
    });
  }, [orderedResult, activeCategory]);

  // title (use i18n on client)
  const pageTitle =
    !activeCategory || activeCategory === "view-all"
      ? t("general.all_catalogue").toUpperCase()
      : activeCategory === "tops"
      ? t("navbar.tops").toUpperCase()
      : activeCategory === "bottoms"
      ? t("navbar.bottoms").toUpperCase()
      : activeCategory === "runaway-pieces" // <-- solicitado
      ? t("navbar.runaway_pieces").toUpperCase()
      : t("general.all_catalogue").toUpperCase();

  // --- JSON-LD: ItemList for catalog ---------------------------------------
  const jsonLd = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.cillan.world";
    const catalogPath = activeCategory ? `/catalog/${activeCategory}` : "/catalog";
    const lang = i18n.resolvedLanguage || i18n.language || "es";

    // Ajusta si tu URL de producto es distinta
    const toProductUrl = (slug?: string) =>
      `${base}/product${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`;

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name:
        !activeCategory || activeCategory === "view-all"
          ? "Catalog — All"
          : `Catalog — ${activeCategory}`,
      url: `${base}${catalogPath}`,
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.map((p, idx) => {
        const slug = p?.attributes?.slug;
        const name =
          getLocalized(p?.attributes as any, "productName", lang) ?? "Product";
        const firstImage = p?.attributes?.images?.data?.[0]?.attributes?.url as
          | string
          | undefined;
        const imageUrl = toAbsoluteMedia(firstImage);

        return {
          "@type": "ListItem",
          position: idx + 1,
          url: toProductUrl(slug),
          item: {
            "@type": "Product",
            name,
            image: imageUrl ? [imageUrl] : undefined,
            url: toProductUrl(slug),
          },
        };
      }),
    };

    const collectionPage = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: itemList.name,
      url: itemList.url,
      hasPart: itemList,
    };

    return JSON.stringify(collectionPage);
  }, [filteredProducts, activeCategory, i18n.language, i18n.resolvedLanguage]);

  return (
    <div className="relative">
      {/* JSON-LD (Catalog) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

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

      {/* Navbar por encima del fondo */}
      <div className="relative z-10">
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
