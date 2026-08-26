import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/formatPrice';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import OrdersFilters from './OrdersFilters';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, string> = {
  received:         'bg-blue-100 text-blue-800',
  processing:       'bg-amber-100 text-amber-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered:        'bg-green-100 text-green-800',
  cancelled:        'bg-red-100 text-red-800',
};

const STATUS_ICON: Record<string, string> = {
  received:         '📥',
  processing:       '⚙️',
  out_for_delivery: '🚚',
  delivered:        '✅',
  cancelled:        '❌',
};

const PAYMENT_LABELS: Record<string, string> = {
  cod:           'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  esewa:         'eSewa',
  khalti:        'Khalti',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; payment?: string; q?: string }>;
}) {
  const { page: pageParam, status: statusParam, payment: paymentParam, q: qParam } = await searchParams;
  const page    = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const status  = statusParam ?? '';
  const payment = paymentParam ?? '';
  const q       = qParam ?? '';
  const from    = (page - 1) * PAGE_SIZE;
  const to      = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status)  query = query.eq('status', status as 'received' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled');
  if (payment) query = query.eq('payment_method', payment as 'cod' | 'esewa' | 'khalti' | 'bank_transfer');
  if (q)       query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,order_number.ilike.%${q}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | number | null>) {
    const sp = new URLSearchParams();
    const merged = { status, payment, q, page: String(page), ...overrides };
    if (merged.status)               sp.set('status',  String(merged.status));
    if (merged.payment)              sp.set('payment', String(merged.payment));
    if (merged.q)                    sp.set('q',       String(merged.q));
    if (merged.page && merged.page !== '1') sp.set('page', String(merged.page));
    const qs = sp.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Orders
          {count != null && (
            <span className="ml-2 text-base font-normal text-slate-400">({count})</span>
          )}
        </h1>
      </div>

      {/* Search + Filter */}
      <OrdersFilters status={status} payment={payment} q={q} />

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3.5 font-medium">Order</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Items</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.map((order) => {
                const itemCount = Array.isArray(order.items) ? (order.items as any[]).length : 0;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 cursor-pointer transition-colors group">
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p className="font-mono font-semibold text-primary group-hover:underline">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('en-NP', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : ''}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p className="font-medium text-slate-900">{order.customer_name}</p>
                        <p className="text-xs text-slate-500">{order.customer_phone}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{order.delivery_city}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {itemCount}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block font-semibold text-slate-900">
                        {formatPrice(order.total ?? 0)}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <span className="text-xs text-slate-600 capitalize">
                          {PAYMENT_LABELS[order.payment_method ?? ''] ?? order.payment_method ?? '—'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_BADGE[order.status ?? ''] ?? 'bg-slate-100 text-slate-700'
                        }`}>
                          <span>{STATUS_ICON[order.status ?? ''] ?? '•'}</span>
                          {order.status?.replace(/_/g, ' ') ?? '—'}
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!orders?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-slate-400 font-medium">No orders found</p>
                    {(status || payment || q) && (
                      <Link href="/admin/orders" className="mt-2 inline-block text-sm text-primary hover:underline">
                        Clear filters
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} · {count} orders
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ page: page - 1 })}
                aria-disabled={page <= 1}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  page <= 1
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
              <Link
                href={buildUrl({ page: page + 1 })}
                aria-disabled={page >= totalPages}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  page >= totalPages
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}