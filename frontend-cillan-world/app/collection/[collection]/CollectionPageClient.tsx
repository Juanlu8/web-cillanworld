"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { CollectionType } from "@/types/collection";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";
import { normalizeImageUrlField } from "@/lib/product-images";

// --- Tipos auxiliares (evitan any) ------------------------------------------
type UnknownRecord = Record<string, unknown>;

type CollectionLike =
  | CollectionType
  | {
      id?: number | string;
      slug?: string;
      collectionName?: string;
      description?: string;
      description_en?: string;
      imageUrl?: string[] | string;
      attributes?: {
        slug?: string;
        collectionName?: string;
        description?: string;
        description_en?: string;
        imageUrl?: string[] | string;
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

function getImageUrls(c: CollectionLike): string[] {
  const anyC = c as UnknownRecord;
  const direct = anyC.imageUrl as string[] | string | undefined;
  const nested = (anyC.attributes as UnknownRecord | undefined)?.imageUrl as
    | string[]
    | string
    | undefined;
  return normalizeImageUrlField(direct ?? nested)
    .map((url) => toMediaUrl(url))
    .filter(Boolean);
}

// ✅ Definir el tipo de las props
type Props = {
  collection: any; // La colección individual ya filtrada por slug en el servidor
};

// ✅ Actualizar la función para recibir props del servidor
export default function CollectionPageClient({ collection }: Props) {
  const router = useRouter();
  const goToHome = () => router.push(`/`);
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "es")
    .slice(0, 2) as "es" | "en";

  // ✅ Usar la colección que viene del servidor
  const [modalImage, setModalImage] = useState<string | null>(null);

  const title = useMemo(() => {
    return getName(collection).toUpperCase() || getSlug(collection).toUpperCase();
  }, [collection]);

  // -------- JSON-LD (Collection) --------------------------------------------
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const collectionName = getName(collection) || title;
  const collectionDesc = getDescription(collection, currentLanguage);

  // Reunimos imágenes (hasta 24 p.ej. para no inflar)
  const imageUrls = getImageUrls(collection).slice(0, 24);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Collection",
    name: collectionName,
    description: collectionDesc,
    url: canonical || undefined,
    image: imageUrls,
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
              <source src="https://res.cloudinary.com/dsyvrdb00/video/upload/q_auto,f_auto/IDKKID_Fashion_film_dcyqgz" type="video/mp4" />
            </video>
          ) : title === "MIEDOS" ? (
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
              <source src="https://res.cloudinary.com/dsyvrdb00/video/upload/q_auto,f_auto/Miedos720_ydzx2l" type="video/mp4" />
            </video>
          ) : (
            <div className="absolute text-black inset-0 w-full h-full bg-white opacity-50 z-0" />
          )}

          {/* Logo centrado */}
          <div className="w-full flex justify-center pt-14 md:pt-10 relative z-10">
            <Image
              src="/images/logo-top.webp"
              alt="Cillán"
              width={1600}
              height={900}
              className="w-64 sm:w-[21rem] md:w-[26rem] lg:w-[31rem] object-contain transition duration-300 hover:scale-105 cursor-pointer"
              onClick={goToHome}
              priority
            />
          </div>

          {/* Título y descripción */}
          <div className="px-4 sm:px-6 md:px-10 pb-8 md:pb-12 relative z-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-white text-outline-black tracking-wide mb-4">
              {title}
            </h1>

            <div className="space-y-4 md:space-y-5">
              {collectionDesc.split(/\n\s*\n/).map((p: string, i: number) => (
                <p
                  key={i}
                  className="text-[15px] md:text-xl leading-relaxed text-white text-outline-black text-justify"
                  style={{ fontFamily: "inherit" }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="w-full">
        <div className="w-full">
          <div className="flex flex-wrap w-full gap-0">
            {imageUrls.length > 0 ? (
              imageUrls.map((src: string, idx: number) => {
                const key = `${collectionName}-${idx}`;
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
                          alt={`${collectionName} ${idx + 1}`}
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
