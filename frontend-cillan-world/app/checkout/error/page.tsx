"use client";

import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import NextImage from "next/image";
import { useTranslation } from "react-i18next";

export default function CheckoutErrorPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const goToHome = () => router.push("/");
  const goToCatalog = () => router.push("/catalog");

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
            <span className="rounded-full border px-4 py-1 text-xs font-semibold tracking-wide bg-red-100 text-red-800 border-red-200">
              PAYMENT CANCELLED
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">
            {t("checkout.cancelled_title") || "Payment Cancelled"}
          </h1>
          <p className="mb-6 text-gray-800 text-center">
            {t("checkout.cancelled_message") ||
              "Your payment was cancelled. No charges have been made to your account."}
          </p>

          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              ⚠️ {t("checkout.cancelled_info") || "You can try again or contact support if you need help."}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            <button
              onClick={goToCatalog}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {t("checkout.tryAgain") || "Try Again"}
            </button>
            <button
              onClick={goToHome}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
            >
              {t("common.backHome") || "Back to Home"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
