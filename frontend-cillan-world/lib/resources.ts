// src/i18n/resources.ts
import type { InitOptions } from "i18next";

import esCommon from "@/locales/es/common.json";
import enCommon from "@/locales/en/common.json";

// —— Recursos (por idioma y namespace) ——
export const resources = {
  es: { common: esCommon },
  en: { common: enCommon },
} as const;

// —— Config base recomendada ——
export const supportedLngs = ["es", "en"] as const;
export type SupportedLng = (typeof supportedLngs)[number];

// Si usas un único namespace:
export const defaultNS = "common" as const;
export const ns = [defaultNS] as const;

// Opciones listas para i18next.init(...)
export const i18nOptions: InitOptions = {
  resources,
  lng: "es",                // idioma inicial
  fallbackLng: "es",
  supportedLngs: [...supportedLngs],
  ns: [...ns],
  defaultNS,
  interpolation: { escapeValue: false },
  returnNull: false,        // evita que t(...) devuelva null si falta la key
};
