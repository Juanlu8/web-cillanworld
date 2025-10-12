"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type Lng = "es" | "en";

const FLAGS: Record<Lng, React.ReactNode> = {
  es: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 rounded-sm overflow-hidden">
      <rect width="24" height="24" fill="#AA151B" />
      <rect y="6" width="24" height="12" fill="#F1BF00" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 rounded-sm overflow-hidden">
      <rect width="24" height="24" fill="#012169" />
      <g strokeWidth="2">
        <path d="M0,0 24,24 M24,0 0,24" stroke="#FFF" />
        <path d="M0,0 24,24 M24,0 0,24" stroke="#C8102E" transform="matrix(.6 0 0 .6 4.8 4.8)"/>
      </g>
      <g>
        <rect x="10" width="4" height="24" fill="#FFF" />
        <rect y="10" width="24" height="4" fill="#FFF" />
        <rect x="11" width="2" height="24" fill="#C8102E" />
        <rect y="11" width="24" height="2" fill="#C8102E" />
      </g>
    </svg>
  ),
};

const LABEL: Record<Lng, string> = { es: "Español", en: "English" };

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const current = (i18n.resolvedLanguage || i18n.language || "es").slice(0, 2) as Lng;

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const change = (lng: Lng) => {
    if (i18n.language !== lng) i18n.changeLanguage(lng);
    document.cookie = `NEXT_LOCALE=${lng}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Item = ({ lng }: { lng: Lng }) => {
    const active = current === lng;
    return (
      <button
        type="button"
        onClick={() => change(lng)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${active ? "bg-gray-50 ring-1 ring-gray-200" : ""}`}
        role="menuitem"
        aria-pressed={active}
      >
        {FLAGS[lng]}
        <span className="font-medium">{LABEL[lng]}</span>
        {active && <span aria-hidden className="ml-auto text-xs text-gray-500">✓</span>}
      </button>
    );
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Seleccionar idioma"
        className={`inline-flex items-center gap-2 rounded-xl border border-gray-500 bg-white/50 backdrop-blur px-3 py-2 shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400`}
      >
        {FLAGS[current]}
        <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Cambiar idioma"
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-lg animate-[fadeIn_.12s_ease-out]"
          style={{ transformOrigin: "top right" }}
        >
          <Item lng="es" />
          <Item lng="en" />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-2px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}


