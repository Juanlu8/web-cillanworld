"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductType } from "@/types/product";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";

type Props = { product: ProductType };

export default function ProductCard({ product }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const rawUrl = product.attributes.images?.data?.[0]?.attributes?.url as string | undefined;
  const src = toMediaUrl(rawUrl);
  const slug = product.attributes.slug;

  const handleClick = () => {
    setClicked(true);
    router.push(`/product?slug=${slug}`);
  };

  return (
    <div className="group w-full aspect-square bg-white p-2 border rounded shadow-sm relative overflow-hidden cursor-pointer">
      {/* Skeleton */}
      {!isImageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 rounded z-0" />
      )}

      {/* Imagen */}
      {src ? (
        <div className="absolute inset-0">
          <Image
            src={src}
            alt={product.attributes.productName}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain transition duration-300 ease-in-out group-hover:scale-105 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onClick={handleClick}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          {t("general.image_missing")}
        </div>
      )}

      {/* Overlay botón/ícono */}
      <button
        type="button"
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 z-10"
        onClick={handleClick}
        aria-label={t("general.view") as string}
      >
        <Eye className={`text-white w-6 h-6 transition ${clicked ? "scale-y-0" : "scale-100"}`} />
      </button>
    </div>
  );
}