"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProducts } from "@/api/useGetProducts";
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

export default function ProductPage() {
  // ← leemos el slug del segmento dinámico
  const { slug } = useParams<{ slug: string }>();
  const slugFromParams = Array.isArray(slug) ? slug[0] : slug;

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

  // Datos
  const { result } = useGetProducts();
  const products: ProductType[] = useMemo(() => result ?? [], [result]);
  const product = useMemo(
    () => products.find((p) => p.attributes?.slug === slugFromParams) || null,
    [products, slugFromParams]
  );

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
  const [showValidation, setShowValidation] = useState(false);
  const { addItem } = useCart();

  const goToHome = () => router.push(`/`);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("product.loading_product")}</p>
      </div>
    );
  }

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
  } = product.attributes;

  return (
    <div className="relative min-h-screen bg-white">
      {/* Marca de agua / logo superior */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-20">
        <Image
          src="/images/logo-top.webp"
          alt="Cillán"
          width={1600}
          height={900}
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
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
              {images?.data.map((image, idx) => {
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
              <div
                className="relative max-w-4xl w-[90vw] max-h-[90vh] p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={modalImage}
                    alt="Imagen ampliada"
                    fill
                    sizes="90vw"
                    className="object-contain rounded"
                    priority
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4 pb-3">
            {images?.data.map((_, index) => (
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
              const baseSlug = slugFromParams.split("-")[0];
              const colorVariants = products.filter(
                (p) =>
                  p.attributes?.slug?.startsWith(`${baseSlug}-`) ||
                  p.attributes?.slug === baseSlug
              );
              return colorVariants.map((variant) => {
                const colorValue = variant.attributes?.color;
                const variantSlug = variant.attributes?.slug ?? "";
                return (
                  <Link
                    key={variant.id}
                    href={`/product/${variantSlug}`}
                    className="transition-transform duration-200 ease-in-out hover:scale-125"
                    title={colorValue}
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
                      src="/images/anilla.png"
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
                  };
                  addItem(added, selectedSize);
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

      <Footer />
    </div>
  );
}
