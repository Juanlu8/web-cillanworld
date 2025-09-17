"use client";

import { useCart } from "@/hooks/use-cart";
import { CartItemType } from "@/types/cartItem";
import { useTranslation } from "react-i18next";
import NextImage from "next/image";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComp = ({ item }: CartItemProps) => {
  const { removeItem, updateQuantity } = useCart();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-b pb-4 mb-4">
      {/* Imagen */}
      <div className="w-24 h-32 relative">
        <NextImage
          src={
            `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.attributes.images?.data?.[0]?.attributes?.url}`
          }
          alt={item.product.attributes.productName}
          width={1600}
          height={1600}
          className="object-cover rounded w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="flex-1 px-4">
        <h3 className="font-bold text-sm">{item.product.attributes.productName}</h3>
        <p className="text-xs mt-1">{t("bag.size")}: {item.size}</p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() =>
              updateQuantity(item.product.attributes.slug, item.size, item.quantity - 1)
            }
            disabled={item.quantity <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            -
          </button>

          <span className="px-2">{item.quantity}</span>

          <button
            onClick={() =>
              updateQuantity(item.product.attributes.slug, item.size, item.quantity + 1)
            }
            disabled={item.quantity >= 20}
            className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Precio y eliminar */}
      <div className="text-right">
        <p className="text-sm font-semibold">
          €{item.product.attributes.price * item.quantity}
        </p>
        <button
          onClick={() => removeItem(item.product.attributes.slug, item.size)}
          className="text-xs text-red-500 hover:underline mt-2 cursor-pointer"
        >
          {t("bag.remove")}
        </button>
      </div>
    </div>
  );
};

export default CartItemComp;
