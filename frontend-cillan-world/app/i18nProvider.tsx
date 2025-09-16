"use client";

import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useMemo } from "react";
import { resources } from "@/lib/resources";
import { i18nOptions } from "@/lib/i18n-options";

export default function I18nProvider({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const i18nClient = useMemo(() => {
    const inst = createInstance();
    inst.use(initReactI18next).init({
      ...i18nOptions,
      resources,
      lng: lang,
    });
    return inst;
  }, [lang]);

  return <I18nextProvider i18n={i18nClient}>{children}</I18nextProvider>;
}