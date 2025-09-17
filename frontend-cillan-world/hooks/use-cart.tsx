"use client";

// store/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import NextImage from "next/image";
import { CartItemType } from "@/types/cartItem";
import { ProductType } from "@/types/product";

// Nuevo tipo que combina producto, talla y cantidad
export interface CartItem extends CartItemType {
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (data: CartItemType, size: string) => void;
  removeItem: (slug: string, size: string) => void;
  removeAll: () => void;
  increaseQuantity: (slug: string, size: string) => void;
  decreaseQuantity: (slug: string, size: string) => void;
  updateQuantity: (slug: string, size: string, quantity: number) => void;
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      isHydrated: false, // 👈 nuevo estado

      addItem: (itemProduct: CartItemType, size: string) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.product?.attributes?.slug === itemProduct.product?.attributes?.slug &&
            item.size === size
        );

        // Frame visual para el toast
        const frame = (
          <div className="text-black w-[320px] min-h-[220px] p-8 flex flex-col justify-center items-center">
            <div className="flex items-center mb-2">
              <span className="font-bold">item added to your cart</span>
              <button className="ml-auto text-lg" onClick={() => toast.dismiss()}>×</button>
            </div>
            <div className="flex gap-3 items-center mb-12">
              <NextImage
                src={itemProduct.product?.attributes?.images?.data?.[0]?.attributes?.url ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${itemProduct.product.attributes.images.data[0].attributes.url}` : '/images/IMG_1.jpg'}
                alt={itemProduct.product?.attributes?.productName}
                width={1600}
                height={1600}
                className="w-40 h-40 object-contain rounded"
              />
              <div>
                <div className="font-bold">{itemProduct.product?.attributes?.productName}</div>
                <div className="text-sm">Size: {size}</div>
              </div>
            </div>
            <button
              className="border border-black rounded-md py-2 mt-2 w-full font-semibold hover:bg-black hover:text-white transition"
              onClick={() => {
                toast.dismiss();
                document.querySelector<HTMLElement>('[aria-label="Cart"]')?.click();
              }}
            >
              View cart ({currentItems.length + 1})
            </button>
            <button
              className="border border-black rounded-md py-4 mt-2 w-full font-semibold hover:bg-black hover:text-white transition"
              onClick={() => {
                toast.dismiss();
                window.location.href = '/checkout';
              }}
            >
              Check out
            </button>
          </div>
        );

        if (existingItemIndex !== -1) {
          const existingItem = currentItems[existingItemIndex];

          if (existingItem.quantity >= 20) {
            return toast.error("Maximum quantity for this item reached");
          }

          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };

          set({ items: updatedItems });
          return toast.success(frame);
        } else {
          set({
            items: [...currentItems, { ...itemProduct, size, quantity: 1 }],
          });
          toast.success(frame);
        }
      },

      removeItem: (slug: string, size: string) => {
        set({
          items: get().items.filter(
            (item) => item.product.attributes.slug !== slug || item.size !== size
          ),
        });
        toast.info("Product removed from cart");
      },

      increaseQuantity: (slug: string, size: string) => {
        const currentItems = get().items;
        const index = currentItems.findIndex(
          (item) => item.product.attributes.slug === slug && item.size === size
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
          (item) => item.product.attributes.slug === slug && item.size === size
        );
        if (index !== -1) {
          const updatedItems = [...currentItems];
          if (updatedItems[index].quantity > 1) {
            updatedItems[index].quantity -= 1;
            set({ items: updatedItems });
          } else {
            // Si la cantidad baja de 1, eliminar el ítem
            updatedItems.splice(index, 1);
            set({ items: updatedItems });
          }
        }
      },

      updateQuantity: (slug, size, quantity) => {
        if (quantity < 1 || quantity > 20) return;

        const updatedItems = get().items.map((item) => {
          if (item.product.attributes.slug === slug && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      removeAll: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        // Cuando se hidrata el estado desde localStorage, marcamos isHydrated
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);