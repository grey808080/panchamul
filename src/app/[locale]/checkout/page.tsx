'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Button } from '@/components/ui/Button';
import { generateOrderNumber } from '@/lib/utils/orderNumber';
import { createPublicClient } from '@/lib/supabase/client';
import AuthModal from '@/components/ui/AuthModal';
import type { User } from '@supabase/supabase-js';

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const supabase = createPublicClient();

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: 'Kohalpur', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecking(false);
      // Pre-fill name from profile
      if (data.user?.user_metadata?.full_name) {
        setForm(f => ({ ...f, name: data.user!.user_metadata.full_name }));
      }
    });
  }, []);

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
    if (!user) { setShowAuth(true); return; }
    if (!validate() || items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(i => ({
            product_id: i.id,
            name_en: i.name_en,
            name_np: i.name_np,
            quantity: i.quantity,
            price: i.price,
          })),
          payment_method: paymentMethod,
          order_number: generateOrderNumber(),
          total: getTotal(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Order failed');
      }
      const data = await res.json();
      clearCart();
      router.push(`/orders/${data.order_number}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('orderFailed');
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();
  const paymentMethods = [
    { id: 'cod', label: t('cod'), icon: '💵', available: true },
    { id: 'esewa', label: 'eSewa', icon: '📱', available: false },
    { id: 'khalti', label: 'Khalti', icon: '💜', available: false },
    { id: 'bank_transfer', label: t('bankTransfer'), icon: '🏦', available: true },
  ];

  if (authChecking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading...</div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">{t('emptyCart')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">{t('title')}</h1>

        {/* Auth notice */}
        {!user && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800">Sign in to complete your order</p>
              <p className="text-sm text-amber-600 mt-0.5">You need an account to purchase products</p>
            </div>
            <Button onClick={() => setShowAuth(true)} className="shrink-0">
              Sign In
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-5">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 space-y-4">
                <h2 className="text-base font-semibold text-slate-800">{t('customerInfo')}</h2>
                {['name', 'phone', 'address', 'city'].map((field) => (
                  <div key={field}>
                    <label className="label">{t(field)}</label>
                    <input
                      type={field === 'phone' ? 'tel' : 'text'}
                      value={form[field as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className={`input-field ${errors[field] ? 'border-red-300 focus:ring-red-200' : ''}`}
                      placeholder={t(`${field}Placeholder`)}
                    />
                    {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label className="label">{t('notes')}</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder={t('notesPlaceholder')}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                <h2 className="text-base font-semibold text-slate-800 mb-4">{t('paymentMethod')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => pm.available && setPaymentMethod(pm.id)}
                      disabled={!pm.available}
                      className={`relative flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                        !pm.available
                          ? 'cursor-not-allowed border-slate-100 opacity-60'
                          : paymentMethod === pm.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{pm.label}</span>
                      {!pm.available && (
                        <span className="absolute right-2 top-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                          Soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                <h2 className="text-base font-semibold text-slate-800 mb-4">{t('orderSummary')}</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600 line-clamp-1 flex-1 mr-2">
                        {locale === 'np' && item.name_np ? item.name_np : item.name_en} × {item.quantity}
                      </span>
                      <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-3 space-y-2">
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

                <Button type="submit" className="w-full mt-5" size="lg" disabled={loading}>
                  {loading ? t('placing') : user ? t('placeOrder') : 'Sign In to Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          supabase.auth.getUser().then(({ data }) => setUser(data.user));
        }}
        message="Sign in to complete your purchase"
      />
    </div>
  );
}                                                                         