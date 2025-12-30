"use client";

// hooks/use-cart.tsx
import { create } from "zustand";
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware";
import { toast } from "sonner";
import Image from "next/image";
import { getProductImageUrls } from "@/lib/product-images";
import { CartItemType } from "@/types/cartItem";
import { useTranslation } from "react-i18next";

// Ítem en carrito (producto + talla + cantidad)
export interface CartItem extends CartItemType {
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (data: CartItemType, size: string, t: (key: string) => string) => void;
  removeItem: (slug: string, size: string, t: (key: string) => string) => void;
  removeAll: () => void;
  increaseQuantity: (slug: string, size: string) => void;
  decreaseQuantity: (slug: string, size: string) => void;
  updateQuantity: (slug: string, size: string, quantity: number) => void;
}

// Solo persistimos esto
type CartPersisted = { items: CartItem[] };

const persistOptions: PersistOptions<CartStore, CartPersisted> = {
  name: "cart-storage",
  storage: createJSONStorage(() => localStorage),

  // ✅ Solo guardamos 'items'
  partialize: (state) => ({ items: state.items }),

  // ✅ Marcar hidratación SIN tocar 'useCart' (evita TDZ)
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to rehydrate cart storage:", error);
    }
    if (state) {
      // 'state' es el store vivo: marca bandera de hidratación
      state.isHydrated = true;
    }
  },

  version: 1,
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (itemProduct: CartItemType, size: string, t: (key: string) => string) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.product?.attributes?.slug ===
              itemProduct.product?.attributes?.slug && item.size === size
        );

        const imageUrls = getProductImageUrls(itemProduct.product);
        const previewSrc = imageUrls[0] || "/images/IMG_1.jpg";
        const nextLinesCount =
          existingItemIndex !== -1 ? currentItems.length : currentItems.length + 1;

        const frame = (
          <div className="text-black w-[320px] min-h-[220px] p-8 flex flex-col justify-center items-center">
            <div className="flex items-center mb-2 w-full">
              <span className="font-bold">{t("bag.item_added")}</span>
              <button className="ml-auto text-lg" onClick={() => toast.dismiss()}>
                ×
              </button>
            </div>
            <div className="flex gap-3 items-center mb-12 w-full">
              <div className="relative w-40 h-40 overflow-hidden rounded bg-gray-100">
                <Image
                  src={previewSrc}
                  alt={itemProduct.product?.attributes?.productName ?? "Product"}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold line-clamp-2">
                  {itemProduct.product?.attributes?.productName}
                </div>
                <div className="text-sm">{t("bag.size")}: {size}</div>
              </div>
            </div>
            <button
              className="border border-black rounded-md py-2 mt-2 w-full font-semibold hover:bg-black hover:text-white transition"
              onClick={() => {
                toast.dismiss();
                document.querySelector<HTMLElement>('[aria-label="Cart"]')?.click();
              }}
            >
              {t("bag.view_bag")} ({nextLinesCount})
            </button>
            {/* <button
                  className="border border-black rounded-md py-4 mt-2 w-full font-semibold hover:bg-black hover:text-white transition"
                  onClick={() => {
                    toast.dismiss();
                    window.location.href = "/checkout";
                  }}
                >
                  Check out
                </button> */}
          </div>
        );

        if (existingItemIndex !== -1) {
          const existingItem = currentItems[existingItemIndex];
          if (existingItem.quantity >= 20) {
            toast.error(t("bag.max_quantity_reached"));
            return;
          }
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };
          set({ items: updatedItems });
          toast.success(frame);
        } else {
          set({ items: [...currentItems, { ...itemProduct, size, quantity: 1 }] });
          toast.success(frame);
        }
      },

      removeItem: (slug: string, size: string, t: (key: string) => string) => {
        set({
          items: get().items.filter(
            (item) =>
              item.product?.attributes?.slug !== slug || item.size !== size
          ),
        });
        toast.info(t("bag.product_removed"));
      },

      increaseQuantity: (slug: string, size: string) => {
        const currentItems = get().items;
        const index = currentItems.findIndex(
          (item) => item.product?.attributes?.slug === slug && item.size === size
        );
        if (index !== -1 && currentItems[index].quantity < 20) {
          const updatedItems = [...currentItems];
          updatedItems[index].quantity += 1;
          set({ items: updatedItems });
        }
      },

      decreaseQuantity: (slug: string, size: string) => {
        const currentItems = get().items;
        const index = currentItems.findIndex(
          (item) => item.product?.attributes?.slug === slug && item.size === size
        );
        if (index !== -1) {
          const updatedItems = [...currentItems];
          if (updatedItems[index].quantity > 1) {
            updatedItems[index].quantity -= 1;
            set({ items: updatedItems });
          } else {
            updatedItems.splice(index, 1);
            set({ items: updatedItems });
          }
        }
      },

      updateQuantity: (slug: string, size: string, quantity: number) => {
        if (quantity < 1 || quantity > 20) return;
        const updatedItems = get().items.map((item) =>
          item.product?.attributes?.slug === slug && item.size === size
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },

      removeAll: () => set({ items: [] }),
    }),
    persistOptions
  )
);
