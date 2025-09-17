"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { HomeImageType } from '@/types/homeImage';
import { useTranslation } from "react-i18next";
import NextImage from "next/image";

type Props = {
  data: HomeImageType;
};

export default function HomeImageCard({ data }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation();

  // Auto-scroll parent container ONLY when mouse is over this card (not video/background)
  useEffect(() => {
    let scrollInterval: any = null;
    if (isHovering) {
      const container = document.getElementById("auto-scroll-container");
      if (container) {
        scrollInterval = setInterval(() => {
          if (container.scrollTop + container.clientHeight < container.scrollHeight) {
            container.scrollTop += 1;
          } else {
            container.scrollTop = 0;
          }
        }, 30);
      }
    }
    return () => clearInterval(scrollInterval);
  }, [isHovering]);

  // Evita scroll infinito: si se llega al final o principio, permite scroll en el body
  useEffect(() => {
    const container = document.getElementById("auto-scroll-container");
    if (!container) return;
    function handleWheel(e: WheelEvent) {
      if (!isHovering || !container) return;
      const atTop = container.scrollTop === 0;
      const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        // Permite scroll en el body
        e.stopPropagation();
        // No preventDefault, así el scroll pasa al body
      } else {
        // Previene scroll en el body mientras haya contenido
        e.preventDefault();
      }
    }
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [isHovering]);

  // Only set hover if mouse is over the card, not the background
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      setIsHovering(true);
    } else {
      setIsHovering(false);
    }
  }

  const imageUrl = data.image?.url;
  const slug = data.slug;

  const handleClick = () => {
    setClicked(true);
    router.push(`/product?slug=${slug}`);
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
            max-w-[320px]   
            sm:max-w-[420px]
            md:max-w-3xl
            lg:max-w-5xl

            aspect-[3/4]   
            relative flex items-center justify-center

            min-h-[45vh]  
            sm:min-h-[60vh]
            md:min-h-[70vh]

            shadow-none
          "
        >
          <div className="w-full h-full flex items-center overflow-hidden justify-center relative" style={{ background: "transparent" }}>
            {/* Skeleton loader */}
            {!isImageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 rounded z-0" />
            )}

            {/* Imagen principal */}
            {imageUrl ? (
              <NextImage
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`}
                alt={data.homImageName}
                width={1600}
                height={1600}
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-full object-fill transition duration-300 ease-in-out group-hover:scale-105 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleClick}
                style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', position: 'relative', objectFit: 'fill' }}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                {t("general.image_missing")}
              </div>
            )}

            {/* Overlay con icono (visible al hover gracias a 'group') */}
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 z-10"
              onClick={handleClick}
              aria-label="Ver producto"
            >
              {clicked ? (
                <Eye className="text-white w-6 h-6 transform scale-y-0 transition duration-300" />
              ) : (
                <EyeOff className="text-white w-6 h-6 transition duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
