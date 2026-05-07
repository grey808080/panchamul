import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState } from '@/types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id);
          const maxStock = newItem.stock_qty ?? Infinity;
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + newItem.quantity, maxStock);
            return {
              items: state.items.map((i) =>
                i.id === newItem.id
                  ? { ...i, quantity: nextQuantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: Math.min(newItem.quantity, maxStock),
              },
            ],
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  quantity: Math.min(quantity, i.stock_qty ?? Infinity),
                }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'panchamul-cart',
    }
  )
);
