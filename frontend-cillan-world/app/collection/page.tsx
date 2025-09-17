"use client";

import { useGetCollections } from "@/api/useGetCollections";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { CollectionType } from "@/types/collection";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NextImage from "next/image";

type AnyObj = Record<string, any>;

function getSlug(c: AnyObj) {
  return c?.slug ?? c?.attributes?.slug ?? "";
}
function getName(c: AnyObj) {
  return c?.collectionName ?? c?.attributes?.collectionName ?? "";
}
function getDescription(c: AnyObj, lang: "es" | "en") {
  if (lang === "en") {
    return c?.description_en ?? c?.attributes?.description_en ?? "";
  }
  return c?.description ?? c?.attributes?.description ?? "";
}
function getImagesData(c: AnyObj) {
  // Soporta tanto c.images.data como c.images (array directa)
  if (Array.isArray(c?.images)) return c.images;
  if (Array.isArray(c?.images?.data)) return c.images.data;
  if (Array.isArray(c?.attributes?.images)) return c.attributes.images;
  if (Array.isArray(c?.attributes?.images?.data)) return c.attributes.images.data;
  return [];
}
function getImageUrl(img: AnyObj): string | undefined {
  // Soporta tanto { url } como { attributes: { url } }
  return img?.url ?? img?.attributes?.url;
}
function resolveMediaUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

export default function CollectionPage() {
  const router = useRouter();
  const goToHome = () => router.push(`/`);
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "es")
    .slice(0, 2) as "es" | "en";

  const searchParams = useSearchParams();
  const collectionFromURL = (searchParams.get("collection") || "").toLowerCase();

  const { result = [] } = useGetCollections();
  const [modalImage, setModalImage] = useState<string | null>(null);

  const { filteredCollections, title } = useMemo(() => {
    const titleBySlug: Record<string, string> = {
      idkkid: "IDKKID",
      miedos: "MIEDOS",
      opncplddupslnusaddmpc: "OPNCPLDDUPSLNUSADDMPC",
    };
    const slug = collectionFromURL;
    const filtered = (result ?? []).filter(
      (c: CollectionType | AnyObj) => getSlug(c)?.toLowerCase() === slug
    );
    return {
      filteredCollections: filtered,
      title: titleBySlug[slug] ?? slug?.toUpperCase() ?? "",
    };
  }, [result, collectionFromURL]);

  return (
    <div className="relative">
      {/* Navbar */}
      <div className="z-10">
        <NavBar />
      </div>

      {/* HERO */}
      <section className="text-white font-handwriting w-full h-full">
        <div className="shadow-sm relative overflow-hidden">
          {/* Video background (o fondo gris) */}
          {title === "IDKKID" ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/video/video-IDKKID.MP4" type="video/mp4" />
            </video>
          ) : title === "MIEDOS" ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/video/video-miedos.MP4" type="video/mp4" />
            </video>
          ) : (
            <div className="absolute text-black inset-0 w-full h-full bg-gray-100 opacity-50 z-0" />
          )}

          {/* Logo centrado */}
          <div className="w-full flex justify-center pt-14 md:pt-10 relative z-10">
            <NextImage
              src="/images/logo-top.png"
              alt="Cillán"
              width={1600}
              height={900}
              className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 hover:scale-105 cursor-pointer"
              onClick={goToHome}
            />
          </div>

          {/* Título y descripción */}
          <div className="px-4 sm:px-6 md:px-10 pb-8 md:pb-12 relative z-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-white text-outline-black tracking-wide mb-4">
              {title}
            </h1>

            {filteredCollections.map((collection: AnyObj) => {
              // ...
              const description = getDescription(collection, currentLanguage) || "";
              const paragraphs: string[] = description ? description.split(/\n\s*\n/) : [description];

              return (
                <div key={collection.id} className="space-y-4 md:space-y-5">
                  {paragraphs.map((p: string, i: number) => (
                    <p
                      key={i}
                      className="text-[15px] md:text-xl leading-relaxed text-white text-outline-black text-justify"
                      style={{ fontFamily: "inherit" }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              );

            })}
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="w-full">
        {filteredCollections.map((collection: AnyObj) => {
          const name = getName(collection) || "Collection";
          let imagesData = getImagesData(collection);
          if (!Array.isArray(imagesData)) imagesData = [];
          if (imagesData.length === 0) {
            console.warn("No images found for collection:", name, collection);
          }
          return (
            <div key={collection.id} className="w-full">
              <div className="flex flex-wrap w-full gap-0">
                {imagesData.length > 0 ? (
                  imagesData.map((img: AnyObj, idx: number) => {
                    const raw = getImageUrl(img);
                    const src = resolveMediaUrl(raw);
                    return (
                      <div
                        key={img.id ?? `${name}-${idx}`}
                        className="w-full md:w-1/2 aspect-[3/4] flex items-center justify-center bg-white rounded-none overflow-hidden shadow-none"
                        style={{ minHeight: '40vw', maxHeight: '150vh' }}
                      >
                        {src ? (
                          <NextImage
                            src={src}
                            alt={`${name} ${idx + 1}`}
                            className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:scale-110 cursor-pointer"
                            loading="lazy"
                            decoding="async"
                            width={1600}
                            height={1600}
                            crossOrigin="anonymous"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onClick={() =>
                                      setModalImage(
                                        `${process.env.NEXT_PUBLIC_BACKEND_URL}${raw}`
                                      )
                                    }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            {t("general.image_missing")}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400 text-lg">
                    {t("general.image_missing")}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Modal imagen ampliada */}
          {modalImage && (
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-[9999]"
              onClick={() => setModalImage(null)}
            >
              <div
                className="relative max-w-4xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <NextImage
                  src={modalImage}
                  alt="Imagen ampliada"
                  width={1600}
                  height={1600}
                  className="max-w-full max-h-[90vh] object-contain rounded"
                />
              </div>
            </div>
          )}
      </section>

      <Footer />
    </div>
  );
}


