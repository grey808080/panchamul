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
import { ShieldCheckIcon, TruckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
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
    { id: 'cod',           label: t('cod'),         icon: '💵', available: true,  desc: 'Pay when delivered' },
    { id: 'bank_transfer', label: t('bankTransfer'), icon: '🏦', available: true,  desc: 'Direct bank deposit' },
    { id: 'esewa',         label: 'eSewa',           icon: '📱', available: false, desc: 'Coming soon' },
    { id: 'khalti',        label: 'Khalti',          icon: '💜', available: false, desc: 'Coming soon' },
  ];

  if (authChecking) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-4xl">🛒</p>
      <p className="text-slate-500 font-medium">{t('emptyCart')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-surface-bg border-b border-surface-border">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">Checkout</p>
              <h1 className="font-heading text-2xl font-bold text-ink-primary">{t('title')}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-ink-muted">
              <span className="flex items-center gap-1.5">
                <LockClosedIcon className="h-3.5 w-3.5 text-primary" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5">
                <TruckIcon className="h-3.5 w-3.5 text-primary" />
                Free delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">

        {/* Sign-in notice */}
        {!user && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">Sign in to complete your order</p>
              <p className="text-xs text-amber-600 mt-0.5">You need an account to purchase products</p>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="shrink-0 rounded bg-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-5">

            {/* Left — form */}
            <div className="lg:col-span-3 space-y-4">

              {/* Customer info */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-700">
                    {t('customerInfo')}
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { field: 'name',    type: 'text', label: t('name'),    placeholder: t('namePlaceholder') },
                    { field: 'phone',   type: 'tel',  label: t('phone'),   placeholder: t('phonePlaceholder') },
                    { field: 'address', type: 'text', label: t('address'), placeholder: t('addressPlaceholder') },
                    { field: 'city',    type: 'text', label: t('city'),    placeholder: t('cityPlaceholder') },
                  ].map(({ field, type, label, placeholder }) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        className={`input-field ${errors[field] ? 'border-red-400 focus:ring-red-200' : ''}`}
                        placeholder={placeholder}
                      />
                      {errors[field] && (
                        <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="label">{t('notes')}</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      className="input-field resize-none"
                      placeholder={t('notesPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-700">
                    {t('paymentMethod')}
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-2 gap-2.5">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => pm.available && setPaymentMethod(pm.id)}
                      disabled={!pm.available}
                      className={`relative flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all ${
                        !pm.available
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                          : paymentMethod === pm.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl mt-0.5">{pm.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">{pm.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pm.desc}</p>
                      </div>
                      {!pm.available && (
                        <span className="absolute right-2 top-2 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                          Soon
                        </span>
                      )}
                      {pm.available && paymentMethod === pm.id && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-6 rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-700">
                    {t('orderSummary')}
                  </h2>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                          {item.quantity}
                        </span>
                        <span className={`text-slate-600 line-clamp-2 leading-tight ${locale === 'np' && item.name_np ? 'font-nepali' : ''}`}>
                          {locale === 'np' && item.name_np ? item.name_np : item.name_en}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-100 px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('delivery')}</span>
                    <span className="text-emerald-600 font-semibold">{t('free')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-heading text-base font-bold text-slate-900">{t('total')}</span>
                    <span className="font-heading text-xl font-bold text-slate-900">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <div className="px-5 pb-5">
                  {errors.submit && (
                    <p className="mb-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                      {errors.submit}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                    isLoading={loading}
                  >
                    {loading ? t('placing') : user ? t('placeOrder') : 'Sign In to Order'}
                  </Button>

                  {/* Trust line */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    Secure order · Free delivery in Banke
                  </div>
                </div>
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
