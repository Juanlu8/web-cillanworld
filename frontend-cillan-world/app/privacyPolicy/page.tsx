"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

const COMPANY_NAME = "Cillan World S.L.";
const COMPANY_ID = "CIF B12345678";
const COMPANY_ADDRESS = "Calle de la Moda 123, 28001 Madrid, Espana";
const CONTACT_EMAIL = "cillan.world@gmail.com";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold">{t("privacy_policy.title")}</h1>
            <p className="text-sm text-gray-500">
              <strong>{t("privacy_policy.last_updated")}</strong>
            </p>
          </header>

          <p className="text-gray-800">
            {t("privacy_policy.p1_1")} <strong>{COMPANY_NAME}</strong> ({COMPANY_ID}) {t("privacy_policy.p1_2")} {COMPANY_ADDRESS} {t("privacy_policy.p1_3")}{" "}
            <strong>{CONTACT_EMAIL}</strong>. {t("privacy_policy.p1_4")}
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.data_collected")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{t("privacy_policy.p2_1")}</li>
              <li>{t("privacy_policy.p2_2")}</li>
              <li>{t("privacy_policy.p2_3")}</li>
              <li>{t("privacy_policy.p2_4")}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.legal_base")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{t("privacy_policy.p3_1")}</li>
              <li>{t("privacy_policy.p3_2")}</li>
              <li>{t("privacy_policy.p3_4")}</li>
              <li>{t("privacy_policy.p3_3")}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.data_processors")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{t("privacy_policy.p4_1")}</li>
              <li>{t("privacy_policy.p4_2")}</li>
            </ul>
            <p className="text-gray-800 mt-2">{t("privacy_policy.p4_3")}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.user_rights")}</h2>
            <p className="text-gray-800">
              {t("privacy_policy.p5_1")} <strong>{CONTACT_EMAIL}</strong> {t("privacy_policy.p5_2")} (
              <Link href="https://www.aepd.es" target="_blank" className="text-blue-600 underline">
                www.aepd.es
              </Link>
              ).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.security_retention")}</h2>
            <p className="text-gray-800">
              {t("privacy_policy.p6")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("privacy_policy.contact")}</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{t("privacy_policy.email")}: {CONTACT_EMAIL}</li>
              <li>{t("privacy_policy.address")}: {COMPANY_ADDRESS}</li>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
