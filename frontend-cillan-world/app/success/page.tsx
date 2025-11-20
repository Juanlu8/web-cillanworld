"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import NextImage from "next/image";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/use-cart";

type SessionCheckResponse = {
  id: string;
  status: string | null;
  paymentStatus: string | null;
  amountTotal: number | null;
  currency?: string | null;
  customerEmail?: string;
  customerName?: string;
  paymentIntentStatus?: string | null;
  paymentIntentId?: string | null;
};

type ViewState = "loading" | "success" | "pending" | "failed" | "error";

export default function SuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const { removeAll } = useCart();

  const [sessionData, setSessionData] = useState<SessionCheckResponse | null>(
    null,
  );
  const [state, setState] = useState<ViewState>(
    sessionId ? "loading" : "error",
  );
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setError(t("bag.checkout_error"));
      return;
    }

    const controller = new AbortController();

    const verifySession = async () => {
      setState("loading");
      setError(null);

      try {
        const response = await fetch(
          `/api/orders/session?session_id=${encodeURIComponent(sessionId)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(
            payload?.error || "Unable to verify payment session",
          );
        }

        const data = (await response.json()) as SessionCheckResponse;
        setSessionData(data);

        if (data.paymentStatus === "paid") {
          setState("success");
        } else if (
          data.status === "open" ||
          data.paymentStatus === "unpaid" ||
          data.paymentStatus === "no_payment_required"
        ) {
          setState("pending");
        } else {
          setState("failed");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState("error");
        setError(
          err instanceof Error ? err.message : t("bag.checkout_error"),
        );
      }
    };

    verifySession();
    return () => controller.abort();
  }, [sessionId, t]);

  useEffect(() => {
    if (cartCleared) return;
    if (sessionData?.paymentStatus === "paid") {
      try {
        removeAll();
      } catch {
        // ignore storage quirks
      } finally {
        setCartCleared(true);
      }
    }
  }, [cartCleared, removeAll, sessionData?.paymentStatus]);

  const goToHome = () => router.push(`/`);

  const formattedAmount = useMemo(() => {
    if (!sessionData?.amountTotal) return null;
    const currency = (sessionData.currency || "EUR").toUpperCase();
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format((sessionData.amountTotal ?? 0) / 100);
    } catch {
      return `${(sessionData.amountTotal ?? 0) / 100} ${currency}`;
    }
  }, [sessionData?.amountTotal, sessionData?.currency]);

  const headline = (() => {
    if (state === "success") return t("bag.success_title");
    if (state === "pending") return t("bag.payment_pending_title");
    if (state === "failed") return t("bag.payment_failed_title");
    if (state === "error") return t("bag.checkout_error");
    return t("bag.success_title");
  })();

  const description = (() => {
    if (state === "success") return t("bag.success_message");
    if (state === "pending") return t("bag.payment_pending_message");
    if (state === "failed") return t("bag.payment_failed_message");
    if (state === "error") return error || t("bag.checkout_error");
    return t("bag.payment_pending_message");
  })();

  const badgeStyles =
    state === "success"
      ? "bg-green-100 text-green-800 border-green-200"
      : state === "pending"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : state === "failed" || state === "error"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-slate-100 text-slate-800 border-slate-200";

  const badgeText =
    state === "success"
      ? "PAID"
      : state === "pending"
      ? "PENDING"
      : state === "failed"
      ? "FAILED"
      : state === "error"
      ? "ERROR"
      : "CHECKING";

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
            <span
              className={`rounded-full border px-4 py-1 text-xs font-semibold tracking-wide ${badgeStyles}`}
            >
              {badgeText}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">{headline}</h1>
          <p className="mb-6 text-gray-800 text-center">{description}</p>

          {state !== "error" && sessionId && (
            <div className="mb-6 space-y-2 rounded-xl border border-black/10 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>{t("bag.payment_status_label")}</span>
                <span className="font-semibold">
                  {sessionData?.paymentStatus?.toUpperCase() ?? badgeText}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("bag.payment_amount_label")}</span>
                <span className="font-semibold">
                  {formattedAmount ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("bag.payment_id_label")}</span>
                <span className="font-mono text-xs">
                  {sessionData?.paymentIntentId || sessionId}
                </span>
              </div>
              {sessionData?.customerEmail && (
                <div className="flex justify-between">
                  <span>Email</span>
                  <span>{sessionData.customerEmail}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={goToHome}
            className="border border-black rounded-md py-12 mt-2 w-full cursor-pointer font-semibold hover:bg-black hover:text-white transition"
          >
            {String(t("bag.success_back_to_shop")).toUpperCase()}
          </button>

          {state === "failed" && (
            <p className="mt-4 text-center text-sm text-gray-500">
              {t("bag.payment_try_again")}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

