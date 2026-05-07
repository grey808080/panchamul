'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center py-20 px-4">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.286h5.98zm0 0h6m-6 0a3 3 0 01-5.98.286M7.5 14.25h6m0 0a3 3 0 005.98.286M13.5 14.25a3 3 0 015.98.286M21.75 3h-1.386c-.51 0-.955.343-1.087.835l-.383 1.437M15 9.75H9" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{t('emptyTitle')}</h1>
        <p className="mt-2 text-slate-500">{t('emptySubtitle')}</p>
        <Link href="/products"><Button className="mt-6">{t('continueShopping')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">{t('clearAll')}</button>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemName = locale === 'np' && item.name_np ? item.name_np : item.name_en;
              const stockQty = item.stock_qty ?? 0;
              const decrementDisabled = item.quantity <= 1;
              const incrementDisabled = stockQty > 0 ? item.quantity >= stockQty : true;
              return (
                <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {item.image ? (
                      <Image src={item.image} alt={itemName} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-200 text-slate-400">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-slate-800">{itemName}</h3>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg ring-1 ring-slate-200 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={decrementDisabled}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold border-x border-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={incrementDisabled}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {stockQty > 0 && incrementDisabled && (
                      <p className="mt-1 text-xs font-medium text-amber-600">{t('stockLimit')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('orderSummary')}</h2>
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">{t('subtotal')}</span><span className="font-medium">{formatPrice(total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">{t('delivery')}</span><span className="font-medium text-green-600">{t('free')}</span></div>
              </div>
              <div className="flex justify-between py-4"><span className="font-semibold">{t('total')}</span><span className="text-xl font-bold">{formatPrice(total)}</span></div>
              <Link href="/checkout"><Button className="w-full" size="lg">{t('checkout')}</Button></Link>
              <Link href="/products" className="block mt-3 text-center text-sm text-primary font-medium">{t('continueShopping')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
