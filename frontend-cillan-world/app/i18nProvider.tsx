"use client";

import { useEffect, useMemo } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { i18nOptions, type SupportedLng } from "@/lib/resources";

type Props = {
  children: React.ReactNode;
  /** Idioma a usar en cliente (por defecto "es") */
  lang?: SupportedLng | string;
};

export default function I18nProvider({ children, lang = "es" }: Props) {
  // Creamos una instancia aislada e inicializamos sólo si cambia el idioma
  const i18nClient = useMemo(() => {
    const inst = createInstance();
    inst.use(initReactI18next).init({
      ...i18nOptions, // ya incluye resources, ns, fallbackLng, etc.
      lng: lang,
    });
    return inst;
  }, [lang]);

  // Refleja el idioma en <html lang="...">
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = i18nClient.language;
    }
  }, [i18nClient.language]);

  return <I18nextProvider i18n={i18nClient}>{children}</I18nextProvider>;
}
