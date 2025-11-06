"use client";

import { memo, useCallback } from "react";
import { useCart } from "@/hooks/use-cart";
import type { CartItemType } from "@/types/cartItem";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComp = ({ item }: CartItemProps) => {
  const { t } = useTranslation();
  const { removeItem, updateQuantity } = useCart();
  const [clicked, setClicked] = useState(false);
  const router = useRouter();

  const attrs = item.product.attributes;
  const firstImgUrl =
    (attrs.images?.data?.[0]?.attributes?.url as string | undefined) ?? "";
  const src = toMediaUrl(firstImgUrl);

  const handleDec = useCallback(
    () => updateQuantity(attrs.slug, item.size, Math.max(1, item.quantity - 1)),
    [attrs.slug, item.size, item.quantity, updateQuantity]
  );
  const handleInc = useCallback(
    () => updateQuantity(attrs.slug, item.size, Math.min(20, item.quantity + 1)),
    [attrs.slug, item.size, item.quantity, updateQuantity]
  );
  const handleRemove = useCallback(
    () => removeItem(attrs.slug, item.size, t),
    [attrs.slug, item.size, removeItem]
  );
  const handleClick = () => {
    setClicked(true);
    router.push(`/product/${attrs.slug}`);
  };

  return (
    <div className="flex items-center justify-between border-b pb-4 mb-4">
      {/* Imagen */}
      <div className="w-24 h-32 relative overflow-hidden rounded bg-gray-100 shrink-0">
        {src ? (
          <Image
            src={src}
            alt={attrs.productName}
            fill
            sizes="96px"
            className="object-cover cursor-pointer"
            onClick={handleClick}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[10px] text-gray-400">
            {t("general.image_missing")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-4 min-w-0">
        <h3 className="font-bold text-sm line-clamp-2">{attrs.productName}</h3>
        <p className="text-xs mt-1">
          {t("bag.size")}: {item.size}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleDec}
            disabled={item.quantity <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            aria-label={t("bag.decrease_qty") as string}
          >
            −
          </button>

          <span className="px-2 tabular-nums">{item.quantity}</span>

          <button
            onClick={handleInc}
            disabled={item.quantity >= 20}
            className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            aria-label={t("bag.increase_qty") as string}
          >
            +
          </button>
        </div>
      </div>

      {/* Precio y eliminar */}
      <div className="text-right">
        <p className="text-sm font-semibold">
          €{(attrs.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={handleRemove}
          className="text-xs text-red-600 hover:underline mt-2 cursor-pointer"
        >
          {t("bag.remove")}
        </button>
      </div>
    </div>
  );
};

// Evita re-render si no cambian las props del item
export default memo(CartItemComp);
