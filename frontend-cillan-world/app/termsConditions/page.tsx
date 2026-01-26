"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

const COMPANY_NAME = "mundo CILLÁN";
const COMPANY_ADDRESS = "Calle de la Moda 123, 28001 Madrid, España";
const CONTACT_EMAIL = "cillan.world@gmail.com";
const LOGISTICS_PROVIDER = "Correos Express Paquetería Urgente, S.A.";

export default function TermsConditionsPage() {
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
            <h1 className="text-3xl font-bold">{t("terms_conditions.title")}</h1>
            <p className="text-sm text-gray-500">
              <strong>{t("terms_conditions.last_updated")}</strong>
            </p>
          </header>

          <p className="text-gray-800">
            {t("terms_conditions.p1")}
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle1")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <p className="text-gray-800">
                {t("terms_conditions.p2")}
              </p>
              <li>{t("terms_conditions.emails")}: {CONTACT_EMAIL}</li>
              <li>{t("terms_conditions.fiscal_direction")}: {COMPANY_ADDRESS}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle2")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <p className="text-gray-800">{t("terms_conditions.p3_1")}</p>
              <p className="text-gray-800">{t("terms_conditions.p3_2")}</p>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle3")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P4_1")}</p>
            <p className="text-gray-800">{t("terms_conditions.P4_2")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle4")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P5_1")}</p>
            <p className="text-gray-800">{t("terms_conditions.P5_2")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle5")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P6_1")}</p>
            <p className="text-gray-800">{t("terms_conditions.P6_2")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle6")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P7_1")}</p>
            <p className="text-gray-800">{t("terms_conditions.P7_2")}</p>
            <p className="text-gray-800">{t("terms_conditions.P7_2")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle7")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P7")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle8")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P8_1")}</p>
            <p className="text-gray-800">{t("terms_conditions.P8_2")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle9")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P9")}{" "}
              <Link href="/privacyPolicy" className="text-blue-600 underline">
                {t("terms_conditions.privacy_policy")}
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle10")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P10")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle11")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P11")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("terms_conditions.subtitle12")}</h2>
            <p className="text-gray-800">{t("terms_conditions.P12")}</p>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <p className="text-gray-800">{t("terms_conditions.p12_1")}</p>
              <p className="text-gray-800">{t("terms_conditions.p12_2")}</p>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
