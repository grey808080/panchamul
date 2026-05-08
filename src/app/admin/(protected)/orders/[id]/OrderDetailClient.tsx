'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Button } from '@/components/ui/Button';
import type { Tables } from '@/types';

type Order = Tables<'orders'>;

// Order items are stored as JSON — define the shape we expect
interface OrderItem {
  product_id: string;
  name_en?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  unit_price: number;
}

export default function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status ?? 'received');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError(null);
    // Optimistic update
    setStatus(newStatus as Order['status']);

    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);

    if (!res.ok) {
      // Revert on failure
      setStatus(order.status ?? 'received');
      setError('Failed to update status. Please try again.');
      return;
    }

    router.refresh();
  };

  const items = (order.items ?? []) as OrderItem[];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Order #{order.order_number}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Update Status:</span>
          <select
            value={status ?? 'received'}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-primary"
          >
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product_id}-${index}`}
                  className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-slate-800">
                      {item.name_en || item.product_name || item.name || `Item ${index + 1}`}
                    </div>
                    <div className="text-sm text-slate-500">× {item.quantity}</div>
                  </div>
                  <div className="font-semibold">{formatPrice((item.unit_price || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-medium text-slate-500">Total Amount</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(order.total ?? 0)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Customer Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block">Name</span>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Address</span>
                <p className="font-medium">{order.delivery_address}, {order.delivery_city}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block">Method</span>
                <p className="font-medium capitalize">{order.payment_method}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Date</span>
                <p className="font-medium">
                  {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
              <h2 className="text-lg font-bold text-amber-800 mb-2">Customer Notes</h2>
              <p className="text-sm text-amber-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
