'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import CartModal from "@/components/CartModal";
import { useCart } from "@/hooks/use-cart";
import type { CollectionType } from "@/types/collection";
import { useGetCollections } from "@/api/useGetCollections";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<null | string>(null);
  const [isVisible, setIsVisible] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { items: cartItems } = useCart();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!i18n.isInitialized) return;
    document.documentElement.lang = i18n.language;
  }, [i18n.isInitialized, i18n.language]);

  const { result: collectionsRaw } = useGetCollections();

  // cierre con click fuera + Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const collections: CollectionType[] = useMemo(() => {
    const list = collectionsRaw ?? [];
    return list.slice().sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));
  }, [collectionsRaw]);

  const total = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        if (!item.product?.attributes) return acc;
        return acc + item.product.attributes.price * item.quantity;
      }, 0),
    [cartItems]
  );

  const openCart = useCallback(() => {
    setIsVisible(true);
    requestAnimationFrame(() => setIsCartOpen(true));
  }, []);
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    setTimeout(() => setIsVisible(false), 300);
  }, []);

  const toggleSubmenu = (submenu: string) =>
    setActiveSubmenu((prev) => (prev === submenu ? null : submenu));

  const goTo = (href: string) => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
    router.push(href); // SPA
  };

  if (!i18n.isInitialized) return null;

  return (
    <nav className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 z-50 bg-transparent">
      {/* Botón izquierda (menú) */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="p-2 cursor-pointer"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
        >
          <NextImage
            src="/images/anilla.webp"
            alt="Menú"
            width={943}
            height={943}
            className="w-8 h-8 object-contain"
          />
        </button>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center md:absolute md:top-4 md:left-4 md:block">
            <div
              ref={menuRef}
              id="main-menu"
              role="menu"
              aria-label={t("navbar.menu") as string}
              className="relative w-[350px] h-[350px] bg-[url('/images/anilla.webp')] bg-cover bg-center rounded-full flex items-center justify-center animate-fadeZoom"
            >
              <ul className="text-white text-center space-y-1 text-2xl font-handwriting z-20 relative">
                <li
                  onClick={() => toggleSubmenu("shop")}
                  className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={activeSubmenu === "shop"}
                >
                  {t("navbar.shop").toUpperCase()}
                </li>
                {activeSubmenu === "shop" && (
                  <ul className="mt-1 space-y-0 text-md">
                    <li onClick={() => goTo("/catalog/view-all")} className="hover:uppercase cursor-pointer text-outline-black"> {t("navbar.view_all")} </li>
                    <li onClick={() => goTo("/catalog/tops")} className="hover:uppercase cursor-pointer text-outline-black"> {t("navbar.tops")} </li>
                    <li onClick={() => goTo("/catalog/bottoms")} className="hover:uppercase cursor-pointer text-outline-black"> {t("navbar.bottoms")} </li>
                    <li onClick={() => goTo("/catalog/runaway-pieces")} className="hover:uppercase cursor-pointer text-outline-black"> {t("navbar.runaway_pieces")} </li>
                  </ul>
                )}

                <li
                  onClick={() => toggleSubmenu("universe")}
                  className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={activeSubmenu === "universe"}
                >
                  {t("navbar.universe").toUpperCase()}
                </li>
                {activeSubmenu === "universe" && (
                  <ul className="mt-1 space-y-0 text-md max-h-36 overflow-y-auto">
                    {collections.map((collection) => (
                      <li
                        key={collection.id}
                        onClick={() => goTo(`/collection/${collection.slug}`)}
                        className="hover:uppercase cursor-pointer text-outline-black"
                        role="menuitem"
                      >
                        {collection.collectionName}
                      </li>
                    ))}
                  </ul>
                )}

                <li onClick={() => goTo("/about")} className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black" role="menuitem">
                  {t("navbar.about").toUpperCase()}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Botón derecha (carrito) + LanguageSwitcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={openCart}
          className="p-2 z-20 cursor-pointer"
          aria-label="Cart"
          aria-haspopup="dialog"
          aria-expanded={isCartOpen}
          aria-controls="cart-dialog"
        >
          <div className="relative w-24 h-6">
            <span className="block w-24 text-center text-[15px] font-semibold text-white text-outline-black tracking-wide mb-4">
              {t("bag.your_bag")}
            </span>
            {cartItems.length > 0 && (
              <span
                className="absolute -top-1 -left-1 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 font-semibold"
                aria-live="polite"
              >
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
        </button>
        <LanguageSwitcher />
      </div>

      {/* Modal del carrito */}
      <CartModal
        isVisible={isVisible}
        isCartOpen={isCartOpen}
        cartRef={cartRef}
        closeCart={closeCart}
        cartItems={cartItems}
        total={total}
      />
    </nav>
  );
};

export default Navbar;
