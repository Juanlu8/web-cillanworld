'use client';

import { useGetFeaturedProducts } from '@/api/useGetFeaturedProducts';
import React, { useRef, useState, useEffect } from 'react';
import { ResponseType } from '@/types/response';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import { ProductType } from '@/types/product';
import { Card, CardContent } from './ui/card';
import { useTranslation } from "react-i18next";
import NextImage from "next/image";
import Link from "next/link";
import { toMediaUrl } from "@/lib/media";

const HighlightsCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [dragged, setDragged] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !carouselRef.current) return;
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      if (Math.abs(walk) > 5) setDragged(true);
      carouselRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsActive(false);
        setTimeout(() => setDragged(false), 0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const { loading, result }: ResponseType = useGetFeaturedProducts();

  return (
    <div className="w-full px-4 sm:px-8 py-12 sm:py-16 z-12">
      <h2 className="text-2xl mb-4 tracking-wide">
        {t("general.highlights").toUpperCase()}
      </h2>

      <Carousel>
        <CarouselContent ref={carouselRef} className="-ml-2 md:-ml-4">
          {Array.isArray(result) && result.length > 0 && result.map((product: ProductType) => {
            const { id, attributes } = product;
            const { images, productName, slug } = attributes;

            const lastImg = images?.data?.[images.data.length - 1]?.attributes?.url;
            const src = toMediaUrl(lastImg);

            return (
              <CarouselItem
                key={id}
                className="
                  basis-[165px]
                  sm:basis-[250px]
                  md:basis-[300px]
                  xl:basis-[350px]
                  group
                "
              >
                <div className="p-1">
                  <Card className="h-[250px] sm:h-[350px] md:h-[450px] xl:h-[500px] flex items-center justify-center border border-gray-200 overflow-hidden">
                    <CardContent className="flex items-center justify-center h-full w-full">
                      {src ? (
                        <Link
                          href={`/product?slug=${slug}`}
                          className="block h-full w-full"
                          onClick={(e) => {
                            // si el usuario estaba arrastrando, no navegamos
                            if (dragged) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          {/* Contenedor que define la caja de la imagen */}
                          <div className="relative h-full w-full">
                            {/* Si prefieres mantener una proporción exacta usa: aspect-[3/4] en vez de h-full */}
                            <NextImage
                              src={src}
                              alt={productName ?? "Product image"}
                              fill
                              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                              className="object-cover transition duration-300 ease-in-out rounded group-hover:scale-110 cursor-pointer"
                              // Ojo: con fill no pongas position en style/class en el <Image>
                            />
                          </div>
                        </Link>
                      ) : (
                        <div className="w-full h-full shadow-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                          {t("general.image_missing")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default HighlightsCarousel;