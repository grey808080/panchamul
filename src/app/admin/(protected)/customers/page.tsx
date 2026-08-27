import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';

type CustomerRow = {
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  avg_order_value: number;
};

export default async function CustomersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_name, customer_phone, delivery_city, total, created_at');

  // Aggregate client-side (no RPC needed)
  const map: Record<string, CustomerRow> = {};

  orders?.forEach(o => {
    const key = o.customer_phone;
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        customer_name:   o.customer_name || '',
        customer_phone:  o.customer_phone || '',
        delivery_city:   o.delivery_city || '',
        total_orders:    0,
        total_spent:     0,
        last_order_at:   o.created_at || new Date().toISOString(),
        avg_order_value: 0,
      };
    }
    map[key].total_orders  += 1;
    map[key].total_spent   += Number(o.total);
    if ((o.created_at || '') > map[key].last_order_at) {
      map[key].last_order_at = o.created_at || map[key].last_order_at;
    }
  });

  const customers: CustomerRow[] = Object.values(map)
    .map(c => ({ ...c, avg_order_value: c.total_spent / c.total_orders }))
    .sort((a, b) => b.total_spent - a.total_spent);

  // City breakdown
  const cityMap: Record<string, { orders: number; revenue: number }> = {};
  customers.forEach(c => {
    const city = c.delivery_city || 'Unknown';
    if (!cityMap[city]) cityMap[city] = { orders: 0, revenue: 0 };
    cityMap[city].orders  += c.total_orders;
    cityMap[city].revenue += c.total_spent;
  });
  const cityStats = Object.entries(cityMap)
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const repeatCustomers = customers.filter(c => c.total_orders > 1).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {customers.length} unique customers · {repeatCustomers} repeat buyers
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers',  value: customers.length },
          { label: 'Repeat Buyers',    value: repeatCustomers },
          { label: 'Total Revenue',    value: formatPrice(customers.reduce((s, c) => s + c.total_spent, 0)) },
          {
            label: 'Avg. Order Value',
            // Correct weighted average: total revenue ÷ total orders (not average of individual averages)
            value: formatPrice(
              (() => {
                const totalSpent  = customers.reduce((s, c) => s + c.total_spent, 0);
                const totalOrders = customers.reduce((s, c) => s + c.total_orders, 0);
                return totalOrders > 0 ? totalSpent / totalOrders : 0;
              })()
            ),
          },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Delivery zone breakdown */}
      {cityStats.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <h2 className="text-base font-bold text-slate-800 mb-4">Delivery Zone Breakdown</h2>
          <div className="space-y-3">
            {cityStats.map(c => {
              const maxRevenue = cityStats[0].revenue;
              return (
                <div key={c.city} className="flex items-center gap-4">
                  <p className="text-sm font-medium text-slate-700 w-28 truncate shrink-0">{c.city}</p>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${(c.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-36">
                    <p className="text-xs font-semibold text-slate-800">{formatPrice(c.revenue)}</p>
                    <p className="text-[10px] text-slate-400">{c.orders} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer table — desktop */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">City</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Avg. Order</th>
                <th className="px-6 py-4 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.customer_phone} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 flex items-center gap-2">
                      {c.customer_name}
                      {c.total_orders > 1 && (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          ⭐ Repeat
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{c.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{c.delivery_city}</td>
                  <td className="px-6 py-4 font-medium">{c.total_orders}</td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(c.total_spent)}</td>
                  <td className="px-6 py-4 text-slate-500">{formatPrice(c.avg_order_value)}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(c.last_order_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <p className="text-center text-slate-400 py-16">No customers yet</p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {customers.map(c => (
            <div key={c.customer_phone} className="rounded-2xl ring-1 ring-slate-100 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{c.customer_name}</p>
                {c.total_orders > 1 && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">⭐ Repeat</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{c.customer_phone} · {c.delivery_city}</p>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs text-slate-400">Spent</p>
                  <p className="font-bold text-slate-800">{formatPrice(c.total_spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Orders</p>
                  <p className="font-bold text-slate-800">{c.total_orders}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Last</p>
                  <p className="text-xs font-medium text-slate-600">
                    {new Date(c.last_order_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {customers.length === 0 && <p className="text-center text-slate-400 py-8">No customers yet</p>}
        </div>
      </div>
    </div>
  );
}
