"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import NextImage from "next/image";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/use-cart";

type OrderCheckResponse = {
  success: boolean;
  orderId: number;
  status: "pending" | "processing" | "paid" | "failed" | "refunded";
  totalAmount: number;
  currency: string;
  customerEmail: string;
  metadata?: any;
};

type ViewState = "loading" | "success" | "processing" | "failed" | "error";

export default function SuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const sp = useSearchParams();
  const { removeAll } = useCart();

  // Obtener orderId desde sessionStorage o params
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderData, setOrderData] = useState<OrderCheckResponse | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);
  const [fromCheckout, setFromCheckout] = useState(false);

  // Inicializar orderId desde sessionStorage o URL
  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("checkout_orderId");
    const paramOrderId = sp?.get("orderId");
    const source = sp?.get("source");

    const id = paramOrderId ? parseInt(paramOrderId, 10) : storedOrderId ? parseInt(storedOrderId, 10) : null;
    setFromCheckout(source === "checkout" || Boolean(storedOrderId));

    if (id) {
      setOrderId(id);
      // Limpiar sessionStorage
      sessionStorage.removeItem("checkout_orderId");
      sessionStorage.removeItem("checkout_totalAmount");
    } else {
      setState("error");
      setError(t("bag.checkout_error") || "Invalid order ID");
    }
  }, [sp, t]);

  // Consultar estado de la orden
  useEffect(() => {
    if (!orderId) return;

    const controller = new AbortController();

    const checkOrder = async () => {
      setState("loading");
      setError(null);

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337";
        const response = await fetch(`${backendUrl}/api/payment/check-order/${orderId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(errorData?.error || "Unable to verify order");
        }

        const data = (await response.json()) as OrderCheckResponse;
        setOrderData(data);

        // Mapear estado de orden a estado de vista
        if (data.status === "paid") {
          setState("success");
        } else if (data.status === "processing" || data.status === "pending") {
          setState("processing");
        } else {
          setState("failed");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState("error");
        setError(err instanceof Error ? err.message : t("bag.checkout_error") || "Unknown error");
      }
    };

    checkOrder();
    return () => controller.abort();
  }, [orderId, t]);

  // Limpiar carrito tras volver de Redsys (pagado o en procesamiento)
  useEffect(() => {
    if (cartCleared || !fromCheckout) return;
    const shouldClearCart =
      orderData?.status === "paid" || orderData?.status === "processing";

    if (shouldClearCart) {
      try {
        removeAll();
      } catch {
        // ignorar errores de storage
      } finally {
        setCartCleared(true);
      }
    }
  }, [cartCleared, fromCheckout, removeAll, orderData?.status]);

  const goToHome = () => router.push("/");
  const goToCheckout = () => router.push("/catalog");

  const headline = (() => {
    if (state === "success") return t("bag.success_title") || "Payment Successful!";
    if (state === "processing") return t("bag.payment_pending_title") || "Payment Processing";
    if (state === "failed") return t("bag.payment_failed_title") || "Payment Failed";
    return t("bag.checkout_error") || "Error";
  })();

  const description = (() => {
    if (state === "success")
      return t("bag.success_message") || "Your payment has been successfully processed.";
    if (state === "processing")
      return t("bag.payment_pending_message") || "Your payment is being processed. Please wait.";
    if (state === "failed")
      return t("bag.payment_failed_message") || "Your payment could not be processed.";
    return error || (t("bag.checkout_error") || "An error occurred");
  })();

  const badgeStyles =
    state === "success"
      ? "bg-green-100 text-green-800 border-green-200"
      : state === "processing"
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : state === "failed" || state === "error"
          ? "bg-red-100 text-red-800 border-red-200"
          : "bg-slate-100 text-slate-800 border-slate-200";

  const badgeText =
    state === "success"
      ? "PAID"
      : state === "processing"
        ? "PROCESSING"
        : state === "failed"
          ? "FAILED"
          : "ERROR";

  return (
    <div className="relative text-justify">
      {/* Fondo decorativo anilla */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <NextImage
          src="/images/anilla.webp"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-[10.5rem]"
        />
      </div>
      <div className="fixed pt-14 md:pt-10 left-0 w-full flex justify-center z-0">
        <NextImage
          src="/images/logo-top.webp"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-[21rem] md:w-[26rem] lg:w-[31rem] object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={goToHome}
        />
      </div>
      <div className="z-0">
        <NavBar />
      </div>

      <div className="px-8 md:px-10 lg:px-32 xl:px-[30rem] pt-48 md:pt-[17.5rem] pb-12 md:pb-24">
        <div className="rounded-2xl bg-white/90 p-8 shadow-lg backdrop-blur">
          <div className="mb-4 flex items-center justify-center">
            <span className={`rounded-full border px-4 py-1 text-xs font-semibold tracking-wide ${badgeStyles}`}>
              {badgeText}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">{headline}</h1>
          <p className="mb-6 text-gray-800 text-center">{description}</p>

          {/* Información de la orden */}
          {orderData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wide">Order ID</p>
                  <p className="font-semibold text-gray-900">#{orderData.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wide">Amount</p>
                  <p className="font-semibold text-gray-900">
                    €{orderData.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-900">{orderData.customerEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            {state === "success" && (
              <>
                <button
                  onClick={goToHome}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {t("common.backHome") || "Back to Home"}
                </button>
                <a
                  href={`mailto:${orderData?.customerEmail}`}
                  className="text-center text-sm text-blue-600 hover:underline"
                >
                  {t("bag.confirmationEmail") || "Check your email for confirmation"}
                </a>
              </>
            )}

            {state === "processing" && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin">
                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mb-4">
                  {t("bag.paymentProcessing") || "Your payment is being processed. This may take a few moments."}
                </p>
                <button
                  onClick={goToHome}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {t("common.backHome") || "Back to Home"}
                </button>
              </>
            )}

            {(state === "failed" || state === "error") && (
              <>
                <button
                  onClick={goToCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {t("bag.tryAgain") || "Try Again"}
                </button>
                <button
                  onClick={goToHome}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                >
                  {t("common.backHome") || "Back to Home"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

