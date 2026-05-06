export * from './database';

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name_en: string;
  name_np: string | null;
  price: number;
  quantity: number;
  image: string | null;
  slug: string;
  stock_qty: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  payment_method: 'cod' | 'esewa' | 'khalti' | 'bank_transfer';
  notes?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
