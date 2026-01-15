"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import NextImage from "next/image";

export default function LegalNoticePage() {
  const router = useRouter();
  const goToHome = () => router.push(`/`);
  const { t } = useTranslation();

  return (
    <div className="relative text-justify">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <NextImage
          src="/images/anilla.webp"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48"
        />
      </div>

      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-0">
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

      <div className="px-4 md:px-10 pb-24">
        <section className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t("legal_notice.title")}</h1>
            <p className="text-sm text-gray-500">
              <strong>{t("legal_notice.last_updated")}</strong>
            </p>
          </header>

          <p className="text-gray-800">
            {t("legal_notice.p1")}
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("legal_notice.titular_identification")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{t("legal_notice.company_name")}</li>
              <li>{t("legal_notice.company_id")}</li>
              <li>{t("legal_notice.company_address")}</li>
              <li>{t("legal_notice.contact_email")}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("legal_notice.object")}</h2>
            <p className="text-gray-800">
              {t("legal_notice.p2_1")} {t("legal_notice.company_name")}. {t("legal_notice.p2_2")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("legal_notice.intellectual_property")}</h2>
            <p className="text-gray-800">
              {t("legal_notice.p3_1")} {t("legal_notice.company_name")} {t("legal_notice.p3_2")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("legal_notice.contact")}</h2>
            <p className="text-gray-800">
              {t("legal_notice.p4")} {t("legal_notice.contact_email")}.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
