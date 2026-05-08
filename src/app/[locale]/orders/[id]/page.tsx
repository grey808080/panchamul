import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const statusBadge: Record<string, string> = {
  received: 'bg-blue-50 text-blue-700 ring-blue-200',
  processing: 'bg-amber-50 text-amber-700 ring-amber-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 ring-purple-200',
  delivered: 'bg-green-50 text-green-700 ring-green-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

const statusSteps = ['received', 'processing', 'out_for_delivery', 'delivered'] as const;

function safeDate(d: any) {
  try {
    if (!d) return '';
    return new Date(d).toLocaleString('en-NP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
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

  // IMPORTANT: `id` here is the public-facing `order_number` (e.g. PB-2026-1062)
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('order_number', id)
    .single();

  if (error || !order) notFound();

  const items = (order.items as any[]) ?? [];
  const missingNames = items.filter((i) => !i.name_en && i.product_id);
  if (missingNames.length > 0) {
    const productIds = missingNames.map((i) => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name_en, name_np')
      .in('id', productIds);
    if (products?.length) {
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
      order.items = items.map((item) => ({
        ...item,
        name_en: item.name_en || productMap[item.product_id]?.name_en || 'Unknown Product',
        name_np: item.name_np || productMap[item.product_id]?.name_np || null,
      }));
    }
  }

  const badge = statusBadge[order.status ?? ''] ?? 'bg-slate-50 text-slate-700 ring-slate-200';
  const currentStepIndex = Math.max(0, statusSteps.indexOf((order.status ?? 'received') as any));

  const subtotal = Number(order.subtotal ?? 0);
  const delivery = Number(order.delivery_charge ?? 0);
  const total = Number(order.total ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{tO('orderNumber')}</p>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {order.order_number}
              </h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badge}`}>
                {order.status ? tO(`status_${order.status}`) : ''}
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
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-5">{tO('status')}</h2>

              <ol className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {statusSteps.map((step, idx) => {
                  const active = idx <= currentStepIndex;
                  return (
                    <li
                      key={step}
                      className={`rounded-2xl p-4 ring-1 transition-colors ${
                        active ? 'bg-slate-50 ring-slate-200' : 'bg-white ring-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                          {tO(`status_${step}`)}
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-primary' : 'bg-slate-200'}`} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-4">{tO('items')}</h2>

              <div className="divide-y divide-slate-100">
                {((order.items as any[]) ?? []).map((item: any, index: number) => {
                  const name = item.name_en || item.product_name || item.name || `Item ${index + 1}`;
                  const qty = Number(item.quantity ?? 1);
                  const unit = Number(item.unit_price ?? item.price ?? 0);
                  return (
                    <div key={`${item.product_id ?? 'item'}-${index}`} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {formatPrice(unit)} × {qty}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900 shrink-0">{formatPrice(unit * qty)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
                    {order.delivery_address ?? ''}{order.delivery_city ? (
                      <span className="text-slate-500">, {order.delivery_city}</span>
                    ) : null}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-bold text-slate-900 mb-4">{tO('payment')}</h2>

              <div className="text-sm">
                <p className="font-medium text-slate-900 capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 text-sm">
                {subtotal > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-medium text-slate-900">{formatPrice(delivery)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-900">{tO('total')}</span>
                  <span className="text-lg font-extrabold text-slate-900">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {order.notes ? (
              <div className="rounded-2xl bg-amber-50 p-5 sm:p-6 ring-1 ring-amber-200">
                <h2 className="text-base font-bold text-amber-900 mb-2">Notes</h2>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}