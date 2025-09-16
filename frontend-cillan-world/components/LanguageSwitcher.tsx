"use client";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const router = useRouter();
  const { i18n } = useTranslation();

  // idioma actual desde i18next (normalizamos a 'es' | 'en')
  const current = (i18n.resolvedLanguage || i18n.language || "es")
    .slice(0, 2) as "es" | "en";

  const change = (lng: "es" | "en") => {
    if (i18n.language !== lng) i18n.changeLanguage(lng); // feedback inmediato en UI
    document.cookie = `NEXT_LOCALE=${lng}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh(); // o router.replace(window.location.pathname)
  };

  const base =
    "px-2 py-1 border rounded font-semibold text-white text-outline-black tracking-wide transition-colors duration-150";
  const pressed = "bg-black border-white";
  const idle = "bg-transparent border-gray-400";

  return (
    <div className="flex gap-2">
      <button
        onClick={() => change("es")}
        aria-pressed={current === "es"}
        className={`${base} ${current === "es" ? pressed : idle}`}
      >
        ES
      </button>
      <button
        onClick={() => change("en")}
        aria-pressed={current === "en"}
        className={`${base} ${current === "en" ? pressed : idle}`}
      >
        EN
      </button>
    </div>
  );
}
