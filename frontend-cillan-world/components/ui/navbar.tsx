'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import CartModal from "@/components/CartModal";
import { useCart } from "@/hooks/use-cart";
import { CollectionType } from "@/types/collection";
import { useGetCollections } from "@/api/useGetCollections";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import NextImage from "next/image";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<null | string>(null);
  const [isVisible, setIsVisible] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { items: cartItems } = useCart();
  const { t, i18n } = useTranslation();

  // --- Hooks SIEMPRE no condicionales ---
  // 1) Actualizar <html lang="..."> solo cuando i18n esté listo
  useEffect(() => {
    if (!i18n.isInitialized) return;
    document.documentElement.lang = i18n.language;
  }, [i18n.isInitialized, i18n.language]);

  // 2) Obtener colecciones SIEMPRE; si luego no renderizas, no pasa nada
  const { result: collectionsRaw } = useGetCollections();

  // 3) Click fuera para cerrar menú/carrito
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Derivados ---
  const collections: CollectionType[] = useMemo(() => {
    const list = collectionsRaw ?? [];
    // Ordena por 'order' si existe, si no por id
    return list
      .slice()
      .sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));
  }, [collectionsRaw]);

  const total = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        if (!item.product?.attributes) return acc;
        return acc + item.product.attributes.price * item.quantity;
      }, 0),
    [cartItems]
  );

  // --- Handlers ---
  const openCart = () => {
    setIsVisible(true);
    requestAnimationFrame(() => setIsCartOpen(true));
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setTimeout(() => setIsVisible(false), 300); // igual a la animación
  };

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu((prev) => (prev === submenu ? null : submenu));
  };

  const goToCatalog = (category: string) => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
    window.location.href = `/catalog?category=${category}`;
  };

  const goToCollection = (collection: string) => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
    window.location.href = `/collection?collection=${collection}`;
  };

  const goToAbout = () => {
    window.location.href = `/about`;
  };

  // ✅ Si no quieres renderizar nada hasta que i18n esté listo,
  // haz el return DESPUÉS de haber llamado a los hooks.
  if (!i18n.isInitialized) return null;

  return (
    <nav className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 z-50 bg-transparent">
      {/* Botón izquierda (menú con anilla) */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 cursor-pointer"
          aria-label="Menu"
        >
          <NextImage
            src="/images/anilla.png"
            alt="Menú"
            width={943}
            height={943}
            className="w-8 h-8 object-contain"
          />
        </button>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center
                       md:absolute md:top-4 md:left-4 md:block"
          >
            <div
              ref={menuRef}
              className="relative w-[350px] h-[350px] bg-[url('/images/anilla.png')] bg-cover bg-center rounded-full flex items-center justify-center animate-fadeZoom"
            >
              {/* Contenido centrado */}
              <ul className="text-white text-center space-y-1 text-2xl font-handwriting z-20 relative">
                <li
                  onClick={() => toggleSubmenu("shop")}
                  className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black"
                >
                  {t("navbar.shop").toUpperCase()}
                </li>
                {activeSubmenu === "shop" && (
                  <ul className="mt-1 space-y-0 text-md">
                    <li
                      onClick={() => goToCatalog("view-all")}
                      className="hover:uppercase cursor-pointer text-outline-black"
                    >
                      {t("navbar.view_all")}
                    </li>
                    <li
                      onClick={() => goToCatalog("tops")}
                      className="hover:uppercase cursor-pointer text-outline-black"
                    >
                      {t("navbar.tops")}
                    </li>
                    <li
                      onClick={() => goToCatalog("bottoms")}
                      className="hover:uppercase cursor-pointer text-outline-black"
                    >
                      {t("navbar.bottoms")}
                    </li>
                    <li
                      onClick={() => goToCatalog("runaway-pieces")}
                      className="hover:uppercase cursor-pointer text-outline-black"
                    >
                      {t("navbar.runaway_pieces")}
                    </li>
                  </ul>
                )}

                <li
                  onClick={() => toggleSubmenu("universe")}
                  className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black"
                >
                  {t("navbar.universe").toUpperCase()}
                </li>
                {activeSubmenu === "universe" && (
                  <ul className="mt-1 space-y-0 text-md max-h-36 overflow-y-auto">
                    {collections.map((collection) => (
                      <li
                        key={collection.id}
                        onClick={() => goToCollection(collection.slug)}
                        className="hover:uppercase cursor-pointer text-outline-black"
                      >
                        {collection.collectionName}
                      </li>
                    ))}
                  </ul>
                )}

                <li
                  onClick={goToAbout}
                  className="cursor-pointer transition hover:lowercase hover:scale-105 text-outline-black"
                >
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
        >
          <div className="relative w-24 h-6">
            <span className="block w-24 text-center text-[15px] font-semibold text-white text-outline-black tracking-wide mb-4">
              {t("bag.your_bag")}
            </span>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 font-semibold">
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
