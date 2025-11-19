"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { ProductType } from "@/types/product";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useCart } from "@/hooks/use-cart";
import { CartItemType } from "@/types/cartItem";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { toMediaUrl } from "@/lib/media";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getBasicColorName(hex: string | undefined): string {
  if (!hex) return "unknown";

  // Si contiene un guión, procesa cada color por separado
  if (hex.includes("-")) {
    const colors = hex.split("-").map(c => getSingleBasicColorName(c.trim()));
    return colors.join("-");
  }

  return getSingleBasicColorName(hex);
}

function getSingleBasicColorName(hex: string): string {
  if (!hex) return "unknown";

  const rgb = hexToRgb(hex);
  if (!rgb) return "unknown";

  const { r, g, b } = rgb;
  const { h, s, l } = rgbToHsl(r, g, b);

  // ✅ Detecta grises acromáticos (R = G = B) ANTES de cualquier otra cosa
  if (r === g && g === b) {
    if (l < 15) return "black";
    if (l > 90) return "white";
    return "gray";
  }

  // ✅ Colores muy oscuros = negro (aunque tengan algo de saturación)
  if (l < 15) return "black";

  // Grises con baja saturación
  if (s < 10) {
    if (l > 90) return "white";
    return "gray";
  }

  // Colores principales por tono (hue)
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 75) return "yellow";
  if (h < 150) return "green";
  if (h < 200) return "cyan";
  if (h < 260) return "blue";
  if (h < 290) return "purple";
  if (h < 330) return "pink";
  
  return "red"; // Por defecto (ciclo completo)
}

// ✅ Definir el tipo de las props
type Props = {
  initialProduct: any;
  allProducts: any[];
};

// ✅ Actualizar la función para recibir props
export default function ProductPageClient({ initialProduct, allProducts }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "es")
    .slice(0, 2) as "es" | "en";

  const colorMap: Record<string, string> = {
    azul: "blue",
    rojo: "red",
    verde: "green",
    amarillo: "yellow",
    negro: "black",
    blanco: "white",
    gris: "gray",
    marrón: "brown",
    naranja: "orange",
    rosa: "pink",
    morado: "purple",
    beige: "beige",
    celeste: "skyblue",
  };

  function getCssColor(color: string | undefined): string {
    if (!color) return "#ccc";
    if (color.startsWith("linear-gradient")) return color;
    const lower = color.trim().toLowerCase();
    return colorMap[lower] || color;
  }

  const router = useRouter();

  // ✅ Usar los datos que vienen del servidor
  const product = initialProduct;
  const products: ProductType[] = useMemo(() => allProducts ?? [], [allProducts]);

  // Carousel
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    const handleChange = () => setCurrentSlide(api.selectedScrollSnap());
    api.on("select", handleChange);
    handleChange();
    return () => {
      api.off?.("select", handleChange);
    };
  }, [api]);

  // Skeleton por imagen (id => cargada)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setLoaded({});
    setCurrentSlide(0);
  }, [product?.id]);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const { addItem } = useCart();

  const goToHome = () => router.push(`/`);

  useEffect(() => {
    if (product?.attributes?.color) {
      const colorName = getBasicColorName(product.attributes.color.trim());
      setSelectedColor(colorName);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("product.product_not_found")}</p>
      </div>
    );
  }

  const {
    productName,
    details,
    details_en,
    materials,
    materials_en,
    garmentCare,
    garmentCare_en,
    price,
    images,
    slug: productSlug,
  } = product.attributes;

  // --- JSON-LD (Product) ----------------------------------------------------
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const imageUrls =
    images?.data
      ?.map((img: any) => toMediaUrl(img?.attributes?.url))
      .filter(Boolean) ?? [];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    image: imageUrls,
    description: currentLanguage === "es" ? details : (details_en || details),
    brand: { "@type": "Brand", name: "Cillán World" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: String(price ?? 0),
      availability: "https://schema.org/InStock",
      url: canonical || undefined,
    },
  };
  // --------------------------------------------------------------------------

  return (
    <div className="relative min-h-screen bg-white">
      {/* Marca de agua / logo superior */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-20">
        <Image
          src="/images/logo-top.webp"
          alt="Cillán World Logo"
          width={1600}
          height={900}
          className="w-64 sm:w-[21rem] md:w-[26rem] lg:w-[31rem] object-contain transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
          onClick={goToHome}
          priority
        />
      </div>

      <NavBar />

      {/* CONTENIDO DEL PRODUCTO */}
      <div className="max-w-6xl mx-auto px-4 md:px-2 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-48">
        {/* Imagen */}
        <div>
          <Carousel opts={{ align: "start", loop: false }} setApi={setApi} className="w-full">
            <CarouselContent>
              {images?.data.map((image: any, idx: number) => {
                const src = toMediaUrl(image?.attributes?.url);
                return (
                  <CarouselItem key={image.id} className="basis-full">
                    <div className="relative flex justify-center items-center h-[500px] rounded overflow-hidden">
                      {!loaded[image.id] && (
                        <div className="absolute inset-0 animate-pulse bg-gray-100 opacity-50" />
                      )}
                      {src && (
                        <Image
                          ref={idx === 0 ? imgRef : undefined}
                          src={src}
                          alt={`${productName ?? "Producto"} - Imagen ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className={`object-contain rounded cursor-pointer transition-opacity duration-300 ${
                            loaded[image.id] ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={() => setLoaded((prev) => ({ ...prev, [image.id]: true }))}
                          onError={() => setLoaded((prev) => ({ ...prev, [image.id]: true }))}
                          onClick={() => setModalImage(src)}
                          priority={idx === 0}
                        />
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* Modal imagen ampliada */}
          {modalImage && (
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-[9999]"
              onClick={() => setModalImage(null)}
            >
              <div className="relative max-w-4xl w-[90vw] max-h-[90vh]">
               <div className="flex items-center justify-center w-full h-[80vh]">
                <div onClick={e => e.stopPropagation()}>
                  <Image
                    src={modalImage}
                    alt="Imagen ampliada"
                    width={900}
                    height={900}
                    className="object-contain rounded max-h-[80vh] max-w-full"
                    priority
                  />
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4 pb-3">
            {images?.data.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-black scale-110" : "bg-gray-300"
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Anillas de color (variantes por slug base) */}
          <div className="flex justify-center gap-2 mt-4">
            {(() => {
              const baseSlug = productSlug.split("-")[0];
              const colorVariants = products.filter(
                (p) =>
                  p.attributes?.slug?.startsWith(`${baseSlug}-`) ||
                  p.attributes?.slug === baseSlug
              );
              return colorVariants.map((variant) => {
                const colorValue = variant.attributes?.color?.trim();
                const variantSlug = variant.attributes?.slug ?? "";
                const colorName = getBasicColorName(colorValue);
                return (
                  <Link
                    key={variant.id}
                    href={`/product/${variantSlug}`}
                    className="transition-transform duration-200 ease-in-out hover:scale-125"
                    title={colorName}
                    aria-label={variantSlug}
                    prefetch
                    style={{
                      position: "relative",
                      width: 40,
                      height: 40,
                      display: "inline-block",
                    }}
                  >
                    <Image
                      src="/images/anilla.webp"
                      alt="Anilla"
                      width={943}
                      height={943}
                      style={{ width: 40, height: 40, display: "block" }}
                      priority={false}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                        backgroundClip: "padding-box",
                        background: (() => {
                          if (colorValue && colorValue.includes("-")) {
                            const [c1, c2] = colorValue
                              .split("-")
                              .map((c) => getCssColor(c.trim()));
                            return `linear-gradient(90deg, ${c1} 50%, ${c2} 50%)`;
                          }
                          return getCssColor(colorValue);
                        })(),
                      }}
                    />
                  </Link>
                );
              });
            })()}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 pb-42">
          <h1 className="text-4xl font-bold text-center">{productName}</h1>
          <h2 className="text-4xl font-bold text-center">{price}€</h2>

          {/* Tallas */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              <Link className="hover:underline" href="https://midominio.com">
                {t("product.which_size")}
              </Link>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`border rounded-md py-2 font-medium transition cursor-pointer
                    ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "border-black hover:bg-black hover:text-white"
                    }
                  `}
                  onClick={() => {
                    setSelectedSize((prev) => (prev === size ? null : size));
                    setShowValidation(false);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!selectedSize) {
                  setShowValidation(true);
                } else {
                  setShowValidation(false);
                  const added: CartItemType = {
                    product,
                    quantity: 1,
                    size: selectedSize,
                    color: selectedColor || ""
                  };
                  addItem(added, selectedSize, t);
                  setSelectedSize(null);
                }
              }}
              className="border border-black rounded-md py-12 mt-2 w-full font-semibold cursor-pointer hover:bg-black hover:text-white transition"
            >
              {t("product.add_to_bag").toUpperCase()}
            </button>

            {showValidation && (
              <p className="text-red-600 text-sm mt-1">
                {t("product.select_size_validation")}
              </p>
            )}
          </div>

          {/* Secciones de detalle */}
          <div className="space-y-2">
            <details className="mt-1 border px-4 py-3 rounded-md transform transition-transform duration-200 hover:scale-[0.98]">
              <summary className="cursor-pointer font-semibold flex items-center justify-between">
                {t("product.details")}
                <span className="toggle-icon" />
              </summary>
              <p className="mt-2 text-base text-gray-600">
                {currentLanguage === "es" ? details : details_en}
              </p>
            </details>
            <details className="mt-1 border px-4 py-3 rounded-md transform transition-transform duration-200 hover:scale-[0.98]">
              <summary className="cursor-pointer font-semibold flex items-center justify-between">
                {t("product.materials")}
                <span className="toggle-icon" />
              </summary>
              <p className="mt-2 text-base text-gray-600">
                {currentLanguage === "es" ? materials : materials_en}
              </p>
            </details>
            <details className="mt-1 border px-4 py-3 rounded-md transform transition-transform duration-200 hover:scale-[0.98]">
              <summary className="cursor-pointer font-semibold flex items-center justify-between">
                {t("product.garment_care")}
                <span className="toggle-icon" />
              </summary>
              <p className="mt-2 text-base text-gray-600">
                {currentLanguage === "es" ? garmentCare : garmentCare_en}
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* JSON-LD Product for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
