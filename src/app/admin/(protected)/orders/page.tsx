import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/formatPrice';
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  const { data: orders, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Orders
          {count != null && (
            <span className="ml-2 text-base font-normal text-slate-400">({count} total)</span>
          )}
        </h1>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order Number</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{order.customer_name}</p>
                    <p className="text-xs text-slate-500">{order.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatPrice(order.total ?? 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {order.status?.replace('_', ' ') ?? ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-slate-400 hover:text-primary transition-colors inline-block p-2">
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {!orders?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/orders?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition-colors ${
                  page <= 1
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
              <Link
                href={`/admin/orders?page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition-colors ${
                  page >= totalPages
                    ? 'pointer-events-none border-slate-100 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-50 hover:text-primary'
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
