"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import CartItem from "@/components/CartItemComp";
import { CartItemType } from "@/types/cartItem";
import { RefObject } from "react";

interface CartModalProps {
  isVisible: boolean;
  isCartOpen: boolean;
  cartRef: RefObject<HTMLDivElement | null>;
  closeCart: () => void;
  cartItems: CartItemType[];
  total: number;
}

const CartModal = ({ isVisible, isCartOpen, cartRef, closeCart, cartItems, total }: CartModalProps) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className={`cart-overlay ${!isCartOpen ? "fade-out" : ""}`}>
      <div
        ref={cartRef}
        className={`cart-panel ${isCartOpen ? "slide-in" : "slide-out"}`}
      >
        <button
          onClick={closeCart}
          className="absolute top-4 right-4 text-black cursor-pointer hover:text-red-500 transition"
          aria-label="Close cart"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">{t("bag.your_bag")}</h2>

        {cartItems.length === 0 ? (
          <p className="text-sm text-gray-500">{t("bag.bag_is_empty")}</p>
        ) : (
          <>
            {cartItems
              .filter((item) => item.product?.attributes)
              .map((item) => (
                <CartItem
                  key={`${item.product.attributes.slug}-${item.size}`}
                  item={item}
                />
              ))}
            {/* Bloque de privacidad y total */}
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <input type="checkbox" id="privacy" className="mr-2 cursor-pointer" />
                <label htmlFor="privacy" className="text-sm">
                  {t("bag.read_accepted") + ' '}
                  <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">{t("bag.privacy_policy")}</a>.
                </label>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-handwritten">{t("bag.total")}:</span>
                <span className="text-2xl font-handwritten">€{total}</span>
              </div>
              <button
                className="border border-black rounded-md py-12 mt-2 w-full cursor-pointer font-semibold hover:bg-black hover:text-white transition"
              >
                {t("bag.checkout").toUpperCase()}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;
