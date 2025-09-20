"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItemType } from "@/types/cartItem";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { toMediaUrl } from "@/lib/media";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComp = ({ item }: CartItemProps) => {
  const { removeItem, updateQuantity } = useCart();
  const { t } = useTranslation();

  const attrs = item.product.attributes;
  const firstImgUrl = attrs.images?.data?.[0]?.attributes?.url as string | undefined;
  const src = toMediaUrl(firstImgUrl);

  const handleDec = () =>
    updateQuantity(attrs.slug, item.size, Math.max(1, item.quantity - 1));
  const handleInc = () =>
    updateQuantity(attrs.slug, item.size, Math.min(20, item.quantity + 1));

  return (
    <div className="flex items-center justify-between border-b pb-4 mb-4">
      {/* Imagen */}
      <div className="w-24 h-32 relative overflow-hidden rounded bg-gray-100">
        {src ? (
          <Image
            src={src}
            alt={attrs.productName}
            fill
            sizes="96px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
            {t("general.image_missing")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-4">
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
            -
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
          onClick={() => removeItem(attrs.slug, item.size)}
          className="text-xs text-red-500 hover:underline mt-2 cursor-pointer"
        >
          {t("bag.remove")}
        </button>
      </div>
    </div>
  );
};

export default CartItemComp;