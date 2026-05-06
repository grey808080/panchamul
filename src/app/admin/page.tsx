import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils/formatPrice';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: ordersCount },
    { data: revenueData },
    { count: productsCount },
    { count: lowStockCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('status', 'delivered'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_qty', 5).gt('stock_qty', 0),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  const stats = [
    { name: 'Total Orders', value: ordersCount || 0, icon: ShoppingCartIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Total Revenue', value: formatPrice(totalRevenue), icon: CurrencyDollarIcon, color: 'text-green-500', bg: 'bg-green-100' },
    { name: 'Total Products', value: productsCount || 0, icon: ShoppingBagIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Low Stock Alerts', value: lowStockCount || 0, icon: ExclamationTriangleIcon, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-lg">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-center text-slate-500 py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}