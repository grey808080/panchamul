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
import {
  ShieldCheckIcon, TruckIcon, LockClosedIcon,
  UserIcon, MapPinIcon, CreditCardIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

// ─── Payment brand SVGs ────────────────────────────────────────────────────────
function KhaltiLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#5C2D91" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="11" fontWeight="bold" fontFamily="Inter,sans-serif">K</text>
    </svg>
  );
}

function EsewaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#60BB46" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="9" fontWeight="bold" fontFamily="Inter,sans-serif">eSewa</text>
    </svg>
  );
}

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({ number, icon: Icon, title, done }: {
  number: number; icon: React.ElementType; title: string; done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
        done ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
      }`}>
        {done ? <CheckCircleIcon className="h-4 w-4" /> : number}
      </div>
      <div className="flex items-center gap-2 flex-1">
        <Icon className="h-4 w-4 text-slate-400" />
        <h2 className="font-heading text-sm font-bold tracking-wide text-slate-800">{title}</h2>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const supabase = createPublicClient();

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: 'Kohalpur', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user + profile on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUser(u);
      setAuthChecking(false);
      if (!u) return;

      // Pre-fill from profile table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address, city')
        .eq('id', u.id)
        .single();

      if (profile) {
        setForm(f => ({
          ...f,
          name:    profile.full_name ?? u.user_metadata?.full_name ?? f.name,
          phone:   profile.phone    ?? f.phone,
          address: profile.address  ?? f.address,
          city:    profile.city     ?? f.city,
        }));
        setProfileLoaded(!!(profile.phone && profile.address));
      } else if (u.user_metadata?.full_name) {
        setForm(f => ({ ...f, name: u.user_metadata.full_name }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setErrors({});

    try {
      const orderNumber = generateOrderNumber();
      const total = getTotal();

      // Save delivery details to profile for next time
      supabase.from('profiles').upsert({
        id:       user.id,
        full_name: form.name,
        phone:    form.phone,
        address:  form.address,
        city:     form.city,
      }).then(() => {});

      const orderRes = await fetch('/api/orders', {
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
          order_number: orderNumber,
          total,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => null);
        throw new Error(data?.error || 'Order failed');
      }

      const orderData = await orderRes.json();

      if (paymentMethod === 'khalti') {
        const khaltiRes = await fetch('/api/payment/khalti/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.id,
            order_number: orderData.order_number,
            amount: total,
            customer_name: form.name,
            customer_phone: form.phone,
          }),
        });
        if (!khaltiRes.ok) throw new Error((await khaltiRes.json().catch(() => null))?.error || 'Khalti failed');
        const khaltiData = await khaltiRes.json();
        clearCart();
        window.location.href = khaltiData.payment_url;
        return;
      }

      if (paymentMethod === 'esewa') {
        const esewaRes = await fetch('/api/payment/esewa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderData.id, order_number: orderData.order_number, amount: total }),
        });
        if (!esewaRes.ok) throw new Error((await esewaRes.json().catch(() => null))?.error || 'eSewa failed');
        const esewaData = await esewaRes.json();
        clearCart();
        const formEl = document.createElement('form');
        formEl.method = 'POST';
        formEl.action = esewaData.form_action;
        for (const [name, value] of Object.entries(esewaData.fields as Record<string, string>)) {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = name; input.value = String(value);
          formEl.appendChild(input);
        }
        document.body.appendChild(formEl);
        formEl.submit();
        return;
      }

      clearCart();
      router.push(`/orders/${orderData.order_number}`);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : t('orderFailed') });
      setLoading(false);
    }
  };

  const total = getTotal();
  const isKhalti = paymentMethod === 'khalti';
  const isEsewa  = paymentMethod === 'esewa';

  const paymentMethods = [
    { id: 'cod',           label: t('cod'),          desc: 'Pay on delivery', logo: <span className="text-lg">💵</span>, accent: 'border-slate-200' },
    { id: 'bank_transfer', label: t('bankTransfer'),  desc: 'Direct deposit',  logo: <span className="text-lg">🏦</span>, accent: 'border-slate-200' },
    { id: 'khalti',        label: 'Khalti',           desc: 'Digital wallet',  logo: <KhaltiLogo />, accent: 'border-purple-300' },
    { id: 'esewa',         label: 'eSewa',            desc: 'Digital wallet',  logo: <EsewaLogo />,  accent: 'border-emerald-300' },
  ];

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (authChecking) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-medium">Loading your checkout…</span>
      </div>
    </div>
  );

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center gap-5 px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
        <span className="text-5xl">🛒</span>
      </div>
      <div className="text-center">
        <p className="font-heading text-xl font-bold text-slate-800">{t('emptyCart')}</p>
        <p className="text-sm text-slate-400 mt-1">Add some items before checking out</p>
      </div>
      <button
        onClick={() => router.push('/products')}
        className="btn-primary mt-2"
      >
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Panchamul Bijuli</p>
              <h1 className="font-heading text-2xl font-bold text-slate-900 leading-tight">{t('title')}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <LockClosedIcon className="h-3.5 w-3.5 text-emerald-500" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5">
                <TruckIcon className="h-3.5 w-3.5 text-primary" />
                Free delivery in Banke
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Auth banner (not logged in) ── */}
        {!user && (
          <div className="mb-6 relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-orange-50 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Sign in to complete your order</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your details will be saved for next time</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuth(true)}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* ── Saved details notice ── */}
        {user && profileLoaded && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">Your saved delivery details have been pre-filled</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-5">

            {/* ── Left column: steps ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Step 1 — Delivery details */}
              <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-opacity ${!user ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                <StepHeader number={1} icon={MapPinIcon} title={t('customerInfo')} done={!!(form.name && form.phone && form.address)} />
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { field: 'name',    type: 'text', label: t('name'),    placeholder: t('namePlaceholder'),    colSpan: '' },
                    { field: 'phone',   type: 'tel',  label: t('phone'),   placeholder: t('phonePlaceholder'),   colSpan: '' },
                    { field: 'address', type: 'text', label: t('address'), placeholder: t('addressPlaceholder'), colSpan: 'sm:col-span-2' },
                    { field: 'city',    type: 'text', label: t('city'),    placeholder: t('cityPlaceholder'),    colSpan: '' },
                  ] as const).map(({ field, type, label, placeholder, colSpan }) => (
                    <div key={field} className={colSpan}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        className={`input-field ${errors[field] ? 'border-red-400 focus:ring-red-200' : ''}`}
                        placeholder={placeholder}
                      />
                      {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="label">{t('notes')} <span className="normal-case font-normal text-slate-400 tracking-normal">(optional)</span></label>
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

              {/* Step 2 — Payment */}
              <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-opacity ${!user ? 'opacity-60 pointer-events-none select-none' : ''}`}>
                <StepHeader number={2} icon={CreditCardIcon} title={t('paymentMethod')} done={!!paymentMethod} />
                <div className="p-5 grid grid-cols-2 gap-3">
                  {paymentMethods.map((pm) => {
                    const selected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                          selected
                            ? `${pm.accent} bg-white shadow-md ring-1 ${pm.id === 'khalti' ? 'ring-purple-200' : pm.id === 'esewa' ? 'ring-emerald-200' : 'ring-primary/30'}`
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <span className="shrink-0">{pm.logo}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{pm.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{pm.desc}</p>
                        </div>
                        {selected && (
                          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Redirect notice */}
                {(isKhalti || isEsewa) && (
                  <div className={`mx-5 mb-5 rounded-lg px-4 py-3 border text-xs ${
                    isKhalti ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    <p className="font-semibold">
                      {isKhalti ? '💜 You\'ll be redirected to Khalti' : '📱 You\'ll be redirected to eSewa'}
                    </p>
                    <p className="mt-0.5 opacity-80">Your order is created first, then you pay securely on their page.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column: order summary ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-6 rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                  <h2 className="font-heading text-sm font-bold tracking-wide text-slate-800">{t('orderSummary')}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Items with images */}
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      {/* Thumbnail */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                        {item.image ? (
                          <Image src={item.image} alt={item.name_en} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300 text-lg">📦</div>
                        )}
                      </div>
                      {/* Name + qty */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium text-slate-700 line-clamp-2 leading-snug ${locale === 'np' && item.name_np ? 'font-nepali' : ''}`}>
                          {locale === 'np' && item.name_np ? item.name_np : item.name_en}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      {/* Price */}
                      <span className="text-xs font-bold text-slate-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-slate-100 px-5 py-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t('delivery')}</span>
                    <span className="font-semibold text-emerald-600">{t('free')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <span className="font-heading text-sm font-bold text-slate-900">{t('total')}</span>
                    <span className="font-heading text-2xl font-bold text-slate-900">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <div className="px-5 pb-5">
                  {errors.submit && (
                    <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600 font-medium">
                      ⚠️ {errors.submit}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className={`w-full ${
                      isKhalti ? 'bg-purple-600 hover:bg-purple-700' :
                      isEsewa  ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                    }`}
                    size="lg"
                    disabled={loading}
                    isLoading={loading}
                  >
                    {loading
                      ? (isKhalti ? 'Redirecting to Khalti…' : isEsewa ? 'Redirecting to eSewa…' : t('placing'))
                      : user
                      ? (isKhalti ? 'Pay with Khalti 💜' : isEsewa ? 'Pay with eSewa 📱' : t('placeOrder'))
                      : 'Sign In to Order'
                    }
                  </Button>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
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
        onSuccess={async () => {
          const { data } = await supabase.auth.getUser();
          setUser(data.user);
          if (!data.user) return;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, address, city')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            setForm(f => ({
              ...f,
              name:    profile.full_name ?? data.user!.user_metadata?.full_name ?? f.name,
              phone:   profile.phone    ?? f.phone,
              address: profile.address  ?? f.address,
              city:    profile.city     ?? f.city,
            }));
            setProfileLoaded(!!(profile.phone && profile.address));
          }
        }}
        message="Sign in to complete your purchase"
      />
    </div>
  );
}
