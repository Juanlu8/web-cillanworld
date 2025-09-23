// components/CartModal.tsx
"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import CartItem from "@/components/CartItemComp";
import type { CartItemType } from "@/types/cartItem";
import Link from "next/link";
import { createPortal } from "react-dom";

interface CartModalProps {
  isVisible: boolean;           // monta/desmonta UI (pero no hooks)
  isCartOpen: boolean;          // controla animación
  cartRef: React.RefObject<HTMLDivElement | null>;
  closeCart: () => void;
  cartItems: CartItemType[];
  total: number;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function CartModal({
  isVisible,
  isCartOpen,
  cartRef,
  closeCart,
  cartItems,
  total,
}: CartModalProps) {
  const { t } = useTranslation();

  // 👇 hooks SIEMPRE al tope, sin returns antes
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  // Lock de scroll sólo cuando visible y abierto
  useEffect(() => {
    if (!(isVisible && isCartOpen)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible, isCartOpen]);

  // Focus inicial + trap + Esc sólo cuando visible y abierto
  useEffect(() => {
    if (!(isVisible && isCartOpen)) return;

    initialFocusRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCart();
        return;
      }
      if (e.key === "Tab" && cartRef.current) {
        const nodes = Array.from(
          cartRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isVisible, isCartOpen, closeCart, cartRef]);

  const onOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) closeCart();
    },
    [closeCart]
  );

  const itemList = useMemo(
    () =>
      cartItems
        .filter((it) => it.product?.attributes)
        .map((it) => (
          <CartItem
            key={`${it.product.attributes.slug}-${it.size}`}
            item={it}
          />
        )),
    [cartItems]
  );

  // 👇 AHORA sí, después de llamar hooks, podemos decidir no renderizar
  if (!isVisible) return null;

  const panel = (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className={[
        "fixed inset-0 z-[1000] flex justify-end",
        "bg-black/50 transition-opacity",
        isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      aria-hidden={!isCartOpen}
    >
      <div
        ref={cartRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        id="cart-dialog"
        className={[
          "relative h-full w-[min(92vw,420px)] bg-white shadow-xl",
          "transition-transform duration-300 will-change-transform",
          isCartOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={initialFocusRef}
          onClick={closeCart}
          className="absolute top-4 right-4 text-black cursor-pointer hover:text-red-500 transition"
          aria-label={t("bag.close") as string}
        >
          <X size={22} />
        </button>

        <div className="p-5 h-full overflow-y-auto">
          <h2 id="cart-title" className="text-xl font-semibold mb-4">
            {t("bag.your_bag")}
          </h2>

          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">{t("bag.bag_is_empty")}</p>
          ) : (
            <>
              <div aria-live="polite">{itemList}</div>

              <div className="mt-8">
                <div className="flex items-start gap-2 mb-4">
                  <input type="checkbox" id="privacy" className="mt-1 cursor-pointer" />
                  <label htmlFor="privacy" className="text-sm">
                    {t("bag.read_accepted") + " "}
                    <Link
                      href="/privacyPolicy"
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("bag.privacy_policy")}
                    </Link>
                    .
                  </label>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-handwritten">{t("bag.total")}:</span>
                  <span className="text-2xl font-handwritten">€{total.toFixed(2)}</span>
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
    </div>
  );

  if (typeof document !== "undefined") return createPortal(panel, document.body);
  return panel;
}
