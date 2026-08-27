import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxXMarkIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants/stock';
import RevenueChart from '@/components/admin/RevenueChart';
import PaymentBreakdown from '@/components/admin/PaymentBreakdown';
import TopProductsTable from '@/components/admin/TopProductsTable';

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: ordersCount },
    { data: revenueData },
    { count: productsCount },
    { count: lowStockCount },
    { count: pendingCount },
    { count: outOfStockCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('status', 'delivered'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_qty', LOW_STOCK_THRESHOLD)
      .gt('stock_qty', 0),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['received', 'processing']),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('stock_qty', 0)
      .eq('is_active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalRevenue    = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const deliveredCount  = revenueData?.length || 0;
  const aov             = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;

  const stats = [
    {
      name: 'Total Orders',
      value: ordersCount || 0,
      icon: ShoppingCartIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      href: '/admin/orders',
    },
    {
      name: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'text-green-500',
      bg: 'bg-green-100',
      href: '/admin/analytics',
    },
    {
      name: 'Total Products',
      value: productsCount || 0,
      icon: ShoppingBagIcon,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      href: '/admin/products',
    },
    {
      name: 'Low Stock Alerts',
      value: lowStockCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
      href: '/admin/products?stock=low_stock',
      urgent: (lowStockCount || 0) > 0,
    },
    {
      name: 'Pending Orders',
      value: pendingCount || 0,
      icon: ClockIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
      href: '/admin/orders',
      urgent: (pendingCount || 0) > 0,
    },
    {
      name: 'Out of Stock',
      value: outOfStockCount || 0,
      icon: ArchiveBoxXMarkIcon,
      color: 'text-red-500',
      bg: 'bg-red-100',
      href: '/admin/products?stock=out_stock',
      urgent: (outOfStockCount || 0) > 0,
    },
    {
      name: 'Avg. Order Value',
      value: formatPrice(aov),
      icon: CalculatorIcon,
      color: 'text-teal-500',
      bg: 'bg-teal-100',
      href: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Low-stock alert banner */}
      {(lowStockCount || 0) > 0 && (
        <Link
          href="/admin/products?stock=low_stock"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors"
        >
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            {lowStockCount} product{(lowStockCount || 0) > 1 ? 's are' : ' is'} running low on stock — click to review.
          </p>
        </Link>
      )}

      {/* 7-card stat grid — 2 cols on mobile, 3 on md, 4 on lg */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            href={stat.href}
            key={stat.name}
            className={`rounded-2xl bg-white p-4 shadow-sm ring-1 active:scale-95 transition-transform block hover:shadow-md ${
              stat.urgent ? 'ring-amber-200' : 'ring-slate-200/60'
            }`}
          >
            {/* Icon row */}
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            {/* Value — no truncation, wraps if needed */}
            <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{stat.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{stat.name}</p>
          </Link>
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

      {/* Top products */}
      <Suspense fallback={null}>
        <TopProductsTable />
      </Suspense>

      {/* Recent Orders */}
      <div className="rounded-2xl bg-white p-4 lg:p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>

        {/* Mobile cards view */}
        <div className="lg:hidden space-y-3 mb-4">
          {recentOrders?.map((order) => (
            <Link href={`/admin/orders/${order.id}`} key={order.id}
              className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-primary text-sm">{order.order_number}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                  ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="font-medium text-slate-900">{order.customer_name}</p>
              <p className="text-sm text-slate-500">{order.customer_phone}</p>
              <p className="text-xs text-slate-400">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-400">{order.payment_method?.toUpperCase()}</span>
                <span className="font-bold text-slate-900">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
          {(!recentOrders || recentOrders.length === 0) && (
            <p className="text-center text-slate-500 py-8">No orders yet</p>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-lg">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
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
