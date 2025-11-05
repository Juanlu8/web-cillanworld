"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import NextImage from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

export default function SuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const { removeAll } = useCart();

  useEffect(() => {
    try {
      removeAll();
    } catch {
      // noop
    }
  }, [sessionId]);

  const goToHome = () => router.push(`/`);

  return (
    <div className="relative text-justify">
      {/* Fondo decorativo anilla */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
            <NextImage
            src="/images/anilla.webp"
            alt="Fondo anilla"
            width={943}
            height={943}
            className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-42"
            />
        </div>
      <div className="fixed pt-14 md:pt-10 left-0 w-full flex justify-center z-00">
        <NextImage
          src="/images/logo-top.webp"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={goToHome}
        />
      </div>
      <div className="z-0">
        <NavBar />
      </div>

      <div className="px-8 md:px-10 lg:px-32 xl:px-120 pt-48 md:pt-70 pb-12 md:pb-24">
        <div>
          <h1 className="text-3xl font-bold mb-4 text-center">{t("bag.success_title")}</h1>
          <p className="mb-6 text-gray-800">{t("bag.success_message")}</p>
          <button
            onClick={goToHome}
            className="border border-black rounded-md py-12 mt-2 w-full cursor-pointer font-semibold hover:bg-black hover:text-white transition"
         >
            {String(t("bag.success_back_to_shop")).toUpperCase()}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}