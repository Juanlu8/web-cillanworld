"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

export default function CookiesPolicyPage() {
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
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-[10.5rem]"
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
            <h1 className="text-3xl font-bold">{t("cookies_notice.title")}</h1>
            <p className="text-sm text-gray-500">
              <strong>{t("cookies_notice.last_updated")}</strong>
            </p>
          </header>

          <p className="text-gray-800">
            {t("cookies_notice.p1")}
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("cookies_notice.what_are_cookies")}</h2>
            <p className="text-gray-800">
              {t("cookies_notice.p2")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("cookies_notice.cookies_we_use")}</h2>
            <p className="text-gray-800">
              {t("cookies_notice.p3")}
            </p>
            <ul className="list-disc list-inside text-gray-800 space-y-1 mt-2">
              <li>
                <strong>NEXT_LOCALE</strong>: {t("cookies_notice.p4")}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("cookies_notice.third_party_cookies")}</h2>
            <p className="text-gray-800">
              {t("cookies_notice.p5")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("cookies_notice.how_to_manage_cookies")}</h2>
            <p className="text-gray-800">
              {t("cookies_notice.p6")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">{t("cookies_notice.more_info")}</h2>
            <p className="text-gray-800">
              {t("cookies_notice.p7_1")} {t("cookies_notice.contact_email")}. {t("cookies_notice.p7_2")}{" "}
              <Link href="/privacyPolicy" className="text-blue-600 underline">
                {t("bag.privacy_policy")}
              </Link>.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
