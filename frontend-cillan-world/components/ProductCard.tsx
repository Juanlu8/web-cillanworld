"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductType } from "@/types/product";
import { useTranslation } from "react-i18next";
import { getProductImageUrls } from "@/lib/product-images";

type Props = { product: ProductType };

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation();

  const slug = product.attributes.slug;
  const href = `/product/${slug}`;

  const imageUrls = getProductImageUrls(product);
  const src1 = imageUrls[0];
  const src2 = imageUrls[1];

  const [loaded1, setLoaded1] = useState(false);
  const [loaded2, setLoaded2] = useState(false);

  return (
    <Link
      href={href}
      className="group block w-full aspect-square bg-white p-2 border rounded shadow-sm relative overflow-hidden"
      aria-label={product.attributes.productName}
      prefetch
    >
      {/* Skeleton */}
      {!loaded1 && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 rounded z-0" />
      )}

      {/* Imagen base */}
      {src1 ? (
        <div className="absolute inset-0">
          <Image
            src={src1}
            alt={product.attributes.productName}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain transition duration-300 ease-in-out ${loaded1 ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded1(true)}
            loading="lazy"
            priority={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          {t("general.image_missing")}
        </div>
      )}

      {/* Hover swap (segunda imagen por encima) */}
      {src2 && (
        <div className="absolute inset-0">
          <Image
            src={src2}
            alt={`${product.attributes.productName} — alternate`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain transition duration-300 ease-in-out bg-white
                        ${loaded2 ? "opacity-0 group-hover:opacity-100 group-hover:scale-105" : "opacity-0"}`}
            onLoad={() => setLoaded2(true)}
            loading="lazy"
            priority={false}
          />
        </div>
      )}
    </Link>
  );
}
