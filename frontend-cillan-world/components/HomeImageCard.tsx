"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { HomeImageType } from "@/types/homeImage";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";
import Link from 'next/link';

type Props = { data: HomeImageType };

/** Tipos auxiliares para soportar ambas formas de imagen */
type DirectImage = { url?: string | null };
type StrapiImage = { attributes?: { url?: string | null } | null };
type DirectOrStrapiImage = DirectImage | StrapiImage | null | undefined;

/** Extrae la URL sin usar `any` */
function getImageUrl(img: DirectOrStrapiImage): string | undefined {
  const direct = (img as DirectImage | null | undefined)?.url ?? null;
  const attr = (img as StrapiImage | null | undefined)?.attributes?.url ?? null;
  return direct ?? attr ?? undefined;
}

export default function HomeImageCard({ data }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [dragged, setDragged] = useState(false);
  const { t } = useTranslation();

  // Auto-scroll del contenedor padre solo mientras hay hover en la tarjeta
  useEffect(() => {
    let scrollInterval: ReturnType<typeof setInterval> | null = null;
    if (isHovering) {
      const el = document.getElementById("auto-scroll-container");
      if (el) {
        scrollInterval = setInterval(() => {
          if (el.scrollTop + el.clientHeight < el.scrollHeight) {
            el.scrollTop += 1;
          } else {
            el.scrollTop = 0;
          }
        }, 30);
      }
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isHovering]);

  // Bloquea el scroll del body mientras el contenedor tenga recorrido
  useEffect(() => {
    const el = document.getElementById("auto-scroll-container") as HTMLElement | null;
    if (!el) return;
    const node: HTMLElement = el;

    function handleWheel(e: WheelEvent) {
      if (!isHovering) return;
      const atTop = node.scrollTop === 0;
      const atBottom = Math.ceil(node.scrollTop + node.clientHeight) >= node.scrollHeight;

      // Consume el scroll aquí cuando no estamos en extremos
      if (!atTop && !atBottom) e.preventDefault();
      // En extremos, dejamos pasar al body
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [isHovering]);

  // URL de imagen (acepta url directa o en attributes.url) — sin `any`
  const rawUrl = getImageUrl(data.image as unknown as DirectOrStrapiImage);
  const src = toMediaUrl(rawUrl);
  const slug = data.slug;
  const productSlug = data.productSlug;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setIsHovering(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
  };

  const handleClick = () => {
    setClicked(true);
    router.push(`/product/${productSlug}`);
  };

  return (
    <div
      ref={cardRef}
      className="flex justify-center items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="flex justify-center items-center w-full">
        <div
          className="
            group bg-transparent w-full
            max-w-[320px] sm:max-w-[420px] md:max-w-3xl lg:max-w-5xl
            aspect-[3/4] relative flex items-center justify-center
            min-h-[45vh] sm:min-h-[60vh] md:min-h-[70vh]
            shadow-none
          "
        >
          <div className="w-full h-full flex items-center overflow-hidden justify-center relative">
            {/* Skeleton */}
            {!isImageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200 rounded z-0" />}

            {/* Imagen principal */}
            {src ? (
              <Link
                href={`/product/${productSlug}`}
                className="block h-full w-full"
                onClick={(e) => {
                  if (dragged) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <Image
                src={src}
                alt={data.homeImageName}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 50vw"
                className={`object-fill transition duration-300 ease-in-out group-hover:scale-105 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setIsImageLoaded(true)}
                onClick={handleClick}
                loading="lazy"
                priority={false}
              />
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                {t("general.image_missing")}
              </div>
            )}

            {/* Overlay con icono */}
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 z-10"
              onClick={handleClick}
              aria-label={t("general.view") as string}
            >
              {clicked ? (
                <Eye className="text-white w-6 h-6 transform scale-y-0 transition duration-300" />
              ) : (
                <Eye className="text-white w-6 h-6 transition duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}