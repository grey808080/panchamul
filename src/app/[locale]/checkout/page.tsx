'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Button } from '@/components/ui/Button';
import { generateOrderNumber } from '@/lib/utils/orderNumber';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: 'Kohalpur', notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('required');
    if (!form.phone.trim() || form.phone.length < 10) e.phone = t('invalidPhone');
    if (!form.address.trim()) e.address = t('required');
    if (!form.city.trim()) e.city = t('required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
          payment_method: paymentMethod,
          order_number: generateOrderNumber(),
          total: getTotal(),
        }),
      });

      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      clearCart();
      router.push(`/orders/${data.order_number}`);
    } catch {
      setErrors({ submit: t('orderFailed') });
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();

  const paymentMethods = [
    { id: 'cod', label: t('cod'), icon: '💵' },
    { id: 'esewa', label: 'eSewa', icon: '📱' },
    { id: 'khalti', label: 'Khalti', icon: '💜' },
    { id: 'bank', label: t('bankTransfer'), icon: '🏦' },
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">{t('emptyCart')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">{t('customerInfo')}</h2>
                {['name', 'phone', 'address', 'city'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t(field)}</label>
                    <input
                      type={field === 'phone' ? 'tel' : 'text'}
                      value={form[field as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${errors[field] ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'}`}
                      placeholder={t(`${field}Placeholder`)}
                    />
                    {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('notes')}</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                    placeholder={t('notesPlaceholder')}
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('paymentMethod')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('orderSummary')}</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name_en} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('delivery')}</span>
                    <span className="text-green-600 font-medium">{t('free')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {errors.submit && <p className="mt-3 text-sm text-red-500">{errors.submit}</p>}

                <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                  {loading ? t('placing') : t('placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
