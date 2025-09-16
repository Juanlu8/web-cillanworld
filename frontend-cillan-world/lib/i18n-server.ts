import { createInstance } from "i18next";
import { i18nOptions } from "./i18n-options";
import { resources } from "./resources";

export async function initI18nServer(lng: string, ns?: string | string[]) {
  const i18n = createInstance();

  await i18n.init({
    ...i18nOptions,
    resources,
    lng,
    ns,
  });

  // devuelve un 't' fijo para server
  const fixedNs = Array.isArray(ns) ? ns : ns ? [ns] : undefined;
  return {
    i18n,
    t: i18n.getFixedT(lng, fixedNs),
  };
}