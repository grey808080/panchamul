import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Status config — colours, icons, labels
const STATUS_CONFIG = {
  received:         { color: 'blue',   icon: '📥', label: 'Order Received' },
  processing:       { color: 'amber',  icon: '⚙️', label: 'Processing' },
  out_for_delivery: { color: 'purple', icon: '🚚', label: 'Out for Delivery' },
  delivered:        { color: 'green',  icon: '✅', label: 'Delivered' },
  cancelled:        { color: 'red',    icon: '❌', label: 'Cancelled' },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

const BADGE_CLASSES: Record<string, string> = {
  blue:   'bg-blue-50 text-blue-700 ring-blue-200',
  amber:  'bg-amber-50 text-amber-700 ring-amber-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  green:  'bg-green-50 text-green-700 ring-green-200',
  red:    'bg-red-50 text-red-700 ring-red-200',
};

// The 4 forward-progress steps (cancelled is handled separately)
const PROGRESS_STEPS: StatusKey[] = ['received', 'processing', 'out_for_delivery', 'delivered'];

function safeDate(d: unknown) {
  try {
    if (!d) return '';
    return new Date(d as string).toLocaleString('en-NP', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tO = await getTranslations('orders');

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect(`/${locale}/account`);

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('order_number', id)
    .single();

  if (error || !order) notFound();

  // Backfill missing product names
  const items = (order.items as any[]) ?? [];
  const missingNames = items.filter((i) => !i.name_en && i.product_id);
  if (missingNames.length > 0) {
    const productIds = missingNames.map((i) => i.product_id);
    const { data: products } = await supabase
      .from('products').select('id, name_en, name_np').in('id', productIds);
    if (products?.length) {
      const map = Object.fromEntries(products.map((p) => [p.id, p]));
      order.items = items.map((item) => ({
        ...item,
        name_en: item.name_en || map[item.product_id]?.name_en || 'Unknown Product',
        name_np: item.name_np || map[item.product_id]?.name_np || null,
      }));
    }
  }

  const status = (order.status ?? 'received') as StatusKey;
  const isCancelled = status === 'cancelled';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.received;
  const badgeClass = BADGE_CLASSES[cfg.color];
  const currentStepIndex = PROGRESS_STEPS.indexOf(status);

  const subtotal = Number(order.subtotal ?? 0);
  const delivery = Number(order.delivery_charge ?? 0);
  const total = Number(order.total ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{tO('orderNumber')}</p>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                {order.order_number}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeClass}`}>
                <span>{cfg.icon}</span>
                {tO(`status_${status}`)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{safeDate(order.created_at)}</p>
          </div>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900 transition-colors w-full sm:w-auto"
          >
            ← {tO('backToAccount')}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Status tracker ── */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-6">{tO('status')}</h2>

              {isCancelled ? (
                /* Cancelled banner */
                <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-bold text-red-800">Order Cancelled</p>
                    <p className="text-sm text-red-600 mt-0.5">
                      This order has been cancelled. Contact us if you have questions.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: horizontal stepper */}
                  <ol className="hidden sm:flex items-start justify-between">
                    {PROGRESS_STEPS.map((step, idx) => {
                      const completed = idx < currentStepIndex;
                      const current   = idx === currentStepIndex;
                      const isLast    = idx === PROGRESS_STEPS.length - 1;
                      const stepCfg   = STATUS_CONFIG[step];

                      return (
                        <li key={step} className="flex flex-1 flex-col items-center relative">
                          {/* Connector */}
                          {!isLast && (
                            <div className="absolute top-4 left-1/2 w-full h-0.5">
                              <div className={`h-full transition-colors duration-500 ${completed ? 'bg-primary' : 'bg-slate-200'}`} />
                            </div>
                          )}
                          {/* Dot */}
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            completed ? 'border-primary bg-primary' :
                            current   ? 'border-primary bg-white' :
                                        'border-slate-200 bg-white'
                          }`}>
                            {completed ? (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : current ? (
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                              </span>
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                            )}
                          </div>
                          {/* Icon + label */}
                          <span className="mt-1 text-lg">{stepCfg.icon}</span>
                          <span className={`mt-1 text-center text-[11px] font-medium leading-tight px-1 ${
                            completed || current ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {tO(`status_${step}`)}
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Mobile: vertical stepper */}
                  <ol className="sm:hidden space-y-0">
                    {PROGRESS_STEPS.map((step, idx) => {
                      const completed = idx < currentStepIndex;
                      const current   = idx === currentStepIndex;
                      const isLast    = idx === PROGRESS_STEPS.length - 1;
                      const stepCfg   = STATUS_CONFIG[step];

                      return (
                        <li key={step} className="flex gap-4">
                          {/* Left: dot + line */}
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              completed ? 'border-primary bg-primary' :
                              current   ? 'border-primary bg-white' :
                                          'border-slate-200 bg-white'
                            }`}>
                              {completed ? (
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : current ? (
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                                </span>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-slate-300" />
                              )}
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 flex-1 my-1 ${completed ? 'bg-primary' : 'bg-slate-200'}`} style={{ minHeight: 24 }} />
                            )}
                          </div>
                          {/* Right: label */}
                          <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                            <p className={`text-sm font-semibold ${completed || current ? 'text-slate-900' : 'text-slate-400'}`}>
                              {stepCfg.icon} {tO(`status_${step}`)}
                            </p>
                            {current && (
                              <p className="text-xs text-primary mt-0.5">Current status</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>

            {/* Order items */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-4">{tO('items')}</h2>
              <div className="divide-y divide-slate-100">
                {((order.items as any[]) ?? []).map((item: any, index: number) => {
                  const name = item.name_en || item.product_name || item.name || `Item ${index + 1}`;
                  const qty  = Number(item.quantity ?? 1);
                  const unit = Number(item.unit_price ?? item.price ?? 0);
                  return (
                    <div key={`${item.product_id ?? 'item'}-${index}`} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{formatPrice(unit)} × {qty}</p>
                      </div>
                      <p className="font-semibold text-slate-900 shrink-0">{formatPrice(unit * qty)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-4">{tO('details')}</h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">{tO('customerName')}</dt>
                  <dd className="font-medium text-slate-900">{order.customer_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{tO('phone')}</dt>
                  <dd className="font-medium text-slate-900">{order.customer_phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{tO('address')}</dt>
                  <dd className="font-medium text-slate-900">
                    {order.delivery_address}
                    {order.delivery_city && <span className="text-slate-500">, {order.delivery_city}</span>}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-4">{tO('payment')}</h2>
              <p className="text-sm font-medium text-slate-900 capitalize">
                {order.payment_method?.replace(/_/g, ' ')}
              </p>
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 text-sm">
                {subtotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-medium text-slate-900">{formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-900">{tO('total')}</span>
                  <span className="text-lg font-extrabold text-slate-900">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="rounded-2xl bg-amber-50 p-5 sm:p-6 ring-1 ring-amber-200">
                <h2 className="text-base font-bold text-amber-900 mb-2">Notes</h2>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
