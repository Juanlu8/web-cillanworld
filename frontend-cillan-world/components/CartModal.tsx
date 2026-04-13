// components/CartModal.tsx
"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import CartItem from "@/components/CartItemComp";
import CheckoutTPV from "@/components/CheckoutTPV";
import type { CartItemType } from "@/types/cartItem";
import Link from "next/link";
import { createPortal } from "react-dom";

interface CartModalProps {
  isVisible: boolean;
  isCartOpen: boolean;
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
  total
}: CartModalProps) {
  const { t } = useTranslation();

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const privacySectionRef = useRef<HTMLDivElement | null>(null);
  const privacyErrorRef = useRef<HTMLParagraphElement | null>(null);

  // Bloquea scroll al abrir
  useEffect(() => {
    if (!(isVisible && isCartOpen)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible, isCartOpen]);

  // Focus trap + ESC
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

  useEffect(() => {
    if (!privacyError) return;
    privacySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    privacyErrorRef.current?.focus();
  }, [privacyError]);

  const onOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) closeCart();
    },
    [closeCart]
  );

  // UI: lista de items como componentes (NO se envía al backend)
  const itemsUI = useMemo(
    () =>
      cartItems
        .filter((it) => it.product?.attributes)
        .map((it) => (
          <CartItem
            key={`${it.product.attributes.slug}-${it.size}-${it.color}`}
            item={it}
          />
        )),
    [cartItems]
  );

  // Privacidad
  const onChangePrivacy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setPrivacyAccepted(checked);
    if (checked) setPrivacyError(null);
  };

  const onCheckoutClick = async () => {
    try {
      if (!privacyAccepted) {
        setPrivacyError(
          (t("bag.privacy_required") as string) || "Debes aceptar la política de privacidad para continuar"
        );
        return;
      }

      setIsCreatingOrder(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL is not configured");
      }

      const products = cartItems
        .map((item) => {
          const productId = Number(item.product?.id);
          return {
            id: productId,
            quantity: Number(item.quantity) || 1,
            name: item.product?.attributes?.productName,
            size: item.size,
            color: item.color,
          };
        })
        .filter((item) => Number.isFinite(item.id) && item.id > 0);

      if (products.length === 0) {
        throw new Error("No valid products found in cart");
      }

      const response = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            products,
            totalAmount: total,
            currency: "EUR",
            status: "pending",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create order");
      }

      const createdOrderId = data?.data?.id ?? data?.order?.id;
      if (createdOrderId) {
        setOrderId(createdOrderId);
        setShowCheckout(true);
      } else {
        throw new Error("Order was created but no order ID was returned");
      }
    } catch (error) {
      console.error("Checkout order creation error:", error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

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
              <div aria-live="polite">{itemsUI}</div>

              <div className="mt-8" ref={privacySectionRef}>
                <div className="flex items-start gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className={`mt-1 cursor-pointer ${privacyError ? "ring-2 ring-red-500" : ""}`}
                    checked={privacyAccepted}
                    onChange={onChangePrivacy}
                    aria-invalid={!!privacyError}
                    aria-describedby={privacyError ? "privacy-error" : undefined}
                  />
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

                {privacyError && (
                  <p
                    id="privacy-error"
                    role="alert"
                    tabIndex={-1}
                    ref={privacyErrorRef}
                    className="text-sm text-red-600 mb-4"
                  >
                    {privacyError}
                  </p>
                )}

                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-handwritten">
                    {t("bag.total")}:
                  </span>
                  <span className="text-2xl font-handwritten">
                    €{total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={onCheckoutClick}
                  disabled={isCreatingOrder || !privacyAccepted}
                  className="border border-black rounded-md py-3 mt-2 w-full cursor-pointer font-semibold hover:bg-black hover:text-white transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-black"
                >
                  {isCreatingOrder
                    ? "CREANDO PEDIDO..."
                    : String(t("bag.checkout")).toUpperCase()}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );

  const checkoutPanel = showCheckout && orderId ? (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <CheckoutTPV
        orderId={orderId}
        totalAmount={total}
        onClose={() => {
          setShowCheckout(false);
          setOrderId(null);
        }}
      />
    </div>
  ) : null;

  if (typeof document !== "undefined") {
    return createPortal(
      <>
        {panel}
        {checkoutPanel}
      </>,
      document.body
    );
  }

  return (
    <>
      {panel}
      {checkoutPanel}
    </>
  );
}
