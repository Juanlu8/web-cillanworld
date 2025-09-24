"use client";

import { useGetCollections } from "@/api/useGetCollections";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { CollectionType } from "@/types/collection";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";

// --- Tipos auxiliares (evitan any) ------------------------------------------
type UnknownRecord = Record<string, unknown>;

type ImageLike =
  | { id?: number | string; url?: string }
  | { id?: number | string; attributes?: { url?: string } }
  | UnknownRecord;

type ImagesField = { data?: ImageLike[] } | ImageLike[] | undefined;

type CollectionLike =
  | CollectionType
  | {
      id?: number | string;
      slug?: string;
      collectionName?: string;
      description?: string;
      description_en?: string;
      images?: ImagesField;
      attributes?: {
        slug?: string;
        collectionName?: string;
        description?: string;
        description_en?: string;
        images?: ImagesField;
      };
    };

// --- Helpers con narrowing ---------------------------------------------------
function getSlug(c: CollectionLike): string {
  const anyC = c as UnknownRecord;
  const direct = (anyC.slug as string) ?? undefined;
  const nested = (anyC.attributes as UnknownRecord | undefined)?.slug as string | undefined;
  return direct ?? nested ?? "";
}

function getName(c: CollectionLike): string {
  const anyC = c as UnknownRecord;
  const direct = (anyC.collectionName as string) ?? undefined;
  const nested = (anyC.attributes as UnknownRecord | undefined)?.collectionName as
    | string
    | undefined;
  return direct ?? nested ?? "";
}

function getDescription(c: CollectionLike, lang: "es" | "en"): string {
  const anyC = c as UnknownRecord;
  if (lang === "en") {
    const direct = (anyC.description_en as string) ?? undefined;
    const nested = (anyC.attributes as UnknownRecord | undefined)?.description_en as
      | string
      | undefined;
    return direct ?? nested ?? "";
  }
  const direct = (anyC.description as string) ?? undefined;
  const nested = (anyC.attributes as UnknownRecord | undefined)?.description as
    | string
    | undefined;
  return direct ?? nested ?? "";
}

function getImagesData(c: CollectionLike): ImageLike[] {
  const anyC = c as UnknownRecord;
  const direct = anyC.images as ImagesField;
  const nested = (anyC.attributes as UnknownRecord | undefined)?.images as ImagesField;

  const field = direct ?? nested;
  if (!field) return [];
  if (Array.isArray(field)) return field as ImageLike[];
  if (Array.isArray(field.data)) return field.data as ImageLike[];
  return [];
}

function getImageUrl(img: ImageLike): string | undefined {
  const anyImg = img as UnknownRecord;
  const direct = anyImg.url as string | undefined;
  const nested = (anyImg.attributes as UnknownRecord | undefined)?.url as string | undefined;
  return direct ?? nested;
}

// -----------------------------------------------------------------------------

export default function CollectionPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const goToHome = () => router.push(`/`);
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "es")
    .slice(0, 2) as "es" | "en";

  const { result } = useGetCollections();
  const collections: CollectionLike[] = useMemo(() => result ?? [], [result]);

  const [modalImage, setModalImage] = useState<string | null>(null);

  const { filteredCollections, title } = useMemo(() => {
    const titleBySlug: Record<string, string> = {
      idkkid: "IDKKID",
      miedos: "MIEDOS",
      opncplddupslnusaddmpc: "OPNCPLDDUPSLNUSADDMPC",
    };
    const filtered = collections.filter((c) => getSlug(c).toLowerCase() === slug);
    return {
      filteredCollections: filtered,
      title: titleBySlug[slug] ?? slug.toUpperCase(),
    };
  }, [collections, slug]);

  // -------- JSON-LD (Collection) --------------------------------------------
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  // Usa la primera colección filtrada como “principal” para nombre/desc
  const mainCol = filteredCollections[0];
  const collectionName = mainCol ? getName(mainCol) || title : title;
  const collectionDesc =
    mainCol ? getDescription(mainCol, currentLanguage) : "";

  // Reunimos imágenes (hasta 24 p.ej. para no inflar)
  const imageUrls =
    (mainCol ? getImagesData(mainCol) : [])
      .map((img) => toMediaUrl(getImageUrl(img)))
      .filter(Boolean)
      .slice(0, 24);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Collection", // Web semántica: una colección de elementos/obras
    name: collectionName,
    description: collectionDesc,
    url: canonical || undefined,
    image: imageUrls, // array con urls válidas
    isPartOf: { "@type": "WebSite", name: "Cillán World" },
  };
  // --------------------------------------------------------------------------

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
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
              <source src="/video/video-IDKKID.MP4" type="video/mp4" />
            </video>
          ) : title === "MIEDOS" ? (
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
              <source src="/video/video-miedos.MP4" type="video/mp4" />
            </video>
          ) : (
            <div className="absolute text-black inset-0 w-full h-full bg-gray-100 opacity-50 z-0" />
          )}

          {/* Logo centrado */}
          <div className="w-full flex justify-center pt-14 md:pt-10 relative z-10">
            <Image
              src="/images/logo-top.webp"
              alt="Cillán"
              width={1600}
              height={900}
              className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 hover:scale-105 cursor-pointer"
              onClick={goToHome}
              priority
            />
          </div>

          {/* Título y descripción */}
          <div className="px-4 sm:px-6 md:px-10 pb-8 md:pb-12 relative z-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-white text-outline-black tracking-wide mb-4">
              {title}
            </h1>

            {filteredCollections.map((collection) => {
              const description = getDescription(collection, currentLanguage) || "";
              const paragraphs: string[] = description ? description.split(/\n\s*\n/) : [description];

              return (
                <div key={(collection as UnknownRecord).id as number | string} className="space-y-4 md:space-y-5">
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
        {filteredCollections.map((collection) => {
          const name = getName(collection) || "Collection";
          const imagesData = getImagesData(collection);

          if (imagesData.length === 0) {
            console.warn("No images found for collection:", name, collection);
          }

          return (
            <div key={(collection as UnknownRecord).id as number | string} className="w-full">
              <div className="flex flex-wrap w-full gap-0">
                {imagesData.length > 0 ? (
                  imagesData.map((img: ImageLike, idx: number) => {
                    const raw = getImageUrl(img);
                    const src = toMediaUrl(raw);

                    const imgId =
                      typeof img.id === "number" || typeof img.id === "string" ? img.id : undefined;
                    const key: string | number = imgId ?? `${name}-${idx}`;

                    return (
                      <div key={key} className="w-full md:w-1/2">
                        {/* Caja con ratio estable */}
                        <div
                          className="relative aspect-[3/4] bg-white rounded-none overflow-hidden shadow-none"
                          style={{ minHeight: "40vw", maxHeight: "150vh" }}
                        >
                          {src ? (
                            <Image
                              src={src}
                              alt={`${name} ${idx + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover transition duration-300 ease-in-out group-hover:scale-110 cursor-pointer"
                              loading="lazy"
                              onClick={() => setModalImage(src)}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                              {t("general.image_missing")}
                            </div>
                          )}
                        </div>
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
            <div className="relative max-w-4xl w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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
      </section>

      {/* JSON-LD Collection for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Footer />
    </div>
  );
}
