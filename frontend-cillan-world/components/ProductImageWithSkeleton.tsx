import React, { useState, forwardRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props extends React.ComponentPropsWithoutRef<'img'> {
  onLoadCallback?: () => void;
}

const ProductImageWithSkeleton = forwardRef<HTMLImageElement, Props>(
  ({ src, alt, onLoadCallback, onClick, ...rest }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
      <>
        {!isLoaded && (
          <Skeleton className="absolute inset-0 h-full w-full rounded animate-pulse bg-gray-200 z-0" />
        )}
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={`h-full w-auto object-contain rounded cursor-pointer ${isLoaded ? "opacity-100" : "opacity-0"}`}
          crossOrigin="anonymous"
          onLoad={() => {
            setIsLoaded(true);
            onLoadCallback && onLoadCallback();
          }}
          onClick={onClick}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          {...rest}
        />
      </>
    );
  }
);

export default ProductImageWithSkeleton;
