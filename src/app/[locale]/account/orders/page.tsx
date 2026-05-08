import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils/formatPrice';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  received:         'bg-blue-50 text-blue-700',
  processing:       'bg-amber-50 text-amber-700',
  out_for_delivery: 'bg-purple-50 text-purple-700',
  delivered:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-700',
};

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('account');
  const tO = await getTranslations('orders');

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect(`/${locale}/account`);

  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('myOrders')}</h1>
          <Link href="/account" className="text-sm text-slate-500 hover:text-primary transition-colors">
            ← My Account
          </Link>
        </div>

        {!orders?.length ? (
          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-slate-200/60 text-center">
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-slate-100">
              <span className="text-3xl">📦</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">No orders yet</h2>
            <p className="mt-1 text-sm text-slate-500">Your orders will appear here once you shop.</p>
            <Link href="/products" className="mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = (order.items as any[])?.length ?? 0;
              const statusClass = statusColors[order.status ?? ''] ?? 'bg-slate-100 text-slate-600';
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.order_number}`}
                  className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-primary text-sm">{order.order_number}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                          {order.status ? tO(`status_${order.status}`) : ''}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 line-clamp-1">
                        {(order.items as any[])?.map((i: any) => i.name_en).join(', ')}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} ·{' '}
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900">{formatPrice(order.total ?? 0)}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{order.payment_method?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
