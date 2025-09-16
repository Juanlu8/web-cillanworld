import i18n from "i18next";

// Cargador de recursos por HTTP (si prefieres importar JSON estático, usa resources)
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .init({
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    ns: ["common"],
    defaultNS: "common",
    debug: false,
    detection: {
      // orden: URL ?lang=, localStorage, navigator...
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    },
    backend: {
      // ruta a los JSON
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    interpolation: {
      escapeValue: false // React ya escapa
    }
  });

export default i18n;
