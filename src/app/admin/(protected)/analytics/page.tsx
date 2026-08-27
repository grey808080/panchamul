import { Suspense } from 'react';
import RevenueChart from '@/components/admin/RevenueChart';
import PaymentBreakdown from '@/components/admin/PaymentBreakdown';
import TopProductsTable from '@/components/admin/TopProductsTable';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  // Gather high-level stats
  const [
    { data: allOrders },
    { data: deliveredOrders },
    { data: products },
  ] = await Promise.all([
    supabase.from('orders').select('total, status, payment_method, delivery_city, created_at'),
    supabase.from('orders').select('total').eq('status', 'delivered'),
    supabase.from('products').select('stock_qty, is_active, sold_count'),
  ]);

  const totalRevenue  = deliveredOrders?.reduce((s, o) => s + Number(o.total), 0) || 0;
  const deliveredCount = deliveredOrders?.length || 0;
  const aov = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  // City breakdown
  const cityMap: Record<string, number> = {};
  allOrders?.forEach(o => {
    const city = o.delivery_city || 'Unknown';
    cityMap[city] = (cityMap[city] || 0) + 1;
  });
  const topCities = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxCityCount = topCities[0]?.count || 1;

  // Status breakdown
  const statusMap: Record<string, number> = {};
  allOrders?.forEach(o => {
    const s = o.status as string;
    statusMap[s] = (statusMap[s] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Full overview of your store performance</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',    value: formatPrice(totalRevenue) },
          { label: 'Delivered Orders', value: deliveredCount },
          { label: 'Avg. Order Value', value: formatPrice(aov) },
          { label: 'Total Orders',     value: allOrders?.length || 0 },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />}>
          <PaymentBreakdown />
        </Suspense>
      </div>

      {/* Top Products */}
      <Suspense fallback={<div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />}>
        <TopProductsTable />
      </Suspense>

      {/* Order status breakdown */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-base font-bold text-slate-800 mb-4">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['received', 'processing', 'out_for_delivery', 'delivered', 'cancelled'] as const).map(status => {
            const count = statusMap[status] || 0;
            const colors: Record<string, string> = {
              received:         'bg-slate-100 text-slate-700',
              processing:       'bg-blue-100 text-blue-700',
              out_for_delivery: 'bg-amber-100 text-amber-700',
              delivered:        'bg-green-100 text-green-700',
              cancelled:        'bg-red-100 text-red-700',
            };
            return (
              <div key={status} className={`rounded-xl p-3 text-center ${colors[status]}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium mt-0.5 capitalize">{status.replace(/_/g, ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top cities */}
      {topCities.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4">Top Delivery Cities</h2>
          <div className="space-y-3">
            {topCities.map(c => (
              <div key={c.city} className="flex items-center gap-4">
                <p className="text-sm font-medium text-slate-700 w-28 truncate shrink-0">{c.city}</p>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${(c.count / maxCityCount) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700 shrink-0 w-12 text-right">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
