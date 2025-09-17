"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { CollectionType } from "@/types/collection";
import { useTranslation } from "react-i18next";
import NextImage from "next/image";

type Props = {
  collection: CollectionType;
};

export default function CollectionCard({ collection }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const imageUrl = collection.images?.data?.[0]?.url;
  const slug = collection.slug;

  console.log('CollectionCard:', collection);

  const handleClick = () => {
    setClicked(true); // Cambia el icono
    router.push(`/product?slug=${slug}`); // Redirige a otra pantalla
  };

  return (
    <div className="group w-full aspect-square bg-white p-2 border rounded shadow-sm relative overflow-hidden cursor-pointer">
      {/* Skeleton loader */}
      {!isImageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 rounded z-0" />
      )}

      {/* Imagen principal */}
      {imageUrl ? (
        <NextImage
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageUrl}`}
          alt={collection.collectionName}
          onLoad={() => setIsImageLoaded(true)}
          width={1600}
          height={1600}
          className={`w-full h-full object-contain transition duration-300 ease-in-out group-hover:scale-105 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClick}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
          {t("general.image_missing")}
        </div>
      )}

      {/* Botón con ícono al hacer hover */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 
                  transition duration-300 bg-black/40 z-10"
        onClick={handleClick}
      >
        {clicked ? (
          <Eye className="text-white w-6 h-6 transform scale-y-0 transition duration-300" />
        ) : (
          <Eye className="text-white w-6 h-6 transition duration-300" />
        )}
      </div>
    </div>
  );
}