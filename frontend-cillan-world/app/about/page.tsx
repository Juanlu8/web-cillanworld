"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
    
  const { t } = useTranslation();  
  const router = useRouter();
    const goToHome = () => {
    router.push(`/`);
  };


    return (
    <div className="relative text-justify">
      {/* Marca de agua */}
      <div className="fixed pt-14 md:pt-10 left-0 w-full flex justify-center z-00">
        <img
          src="/images/logo-top.png"
          alt="Marca de agua"
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={() => goToHome()}
        />
      </div>
      <div className="z-0">
        <NavBar />
      </div>
      <div className="px-8 md:px-10 lg:px-32 xl:px-120 pt-48 md:pt-70 pb-12 md:pb-24">
        <div>
          <p className="dropcap-logo leading-7 text-base md:text-lg">
            {t("about.is_the")} <strong>{t("about.inner_world").toUpperCase()}</strong> {t("about.p_1_1")} <strong>{t("about.never").toUpperCase()}</strong> {t("about.p_1_2")}
          </p>
        </div>
        <div className="py-12 md:py-24 flex items-center gap-6 md:gap-24">
          <img
            src="/images/foto-peque.png"
            alt="foto nene"
            className="w-24 sm:w-42 md:w-48 lg:w-64 cursor-pointer rounded-full"
            onClick={() => goToHome()}
          />
          <div className="leading-7 text-base md:text-lg">  
            <p>
              <span className="text-4xl font-bold mr-2">Nallic Oigres</span> {t("about.born_as")} <strong>{t("about.alter_ego").toUpperCase()}</strong>{t("about.p_2")}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
