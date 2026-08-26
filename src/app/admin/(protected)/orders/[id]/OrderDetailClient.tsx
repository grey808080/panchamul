'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils/formatPrice';
import { PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { Tables } from '@/types';

type Order = Tables<'orders'>;

interface OrderItem {
  product_id: string;
  name_en?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  unit_price: number;
}

// Main pipeline steps (left → right)
const PIPELINE_STEPS = [
  { value: 'received',         label: 'Received',         desc: 'Order placed' },
  { value: 'processing',       label: 'Processing',       desc: 'Being prepared' },
  { value: 'out_for_delivery', label: 'Out for Delivery', desc: 'On the way' },
  { value: 'delivered',        label: 'Delivered',        desc: 'Completed' },
] as const;

const STEP_COLORS: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  received:         { ring: 'ring-blue-500',   bg: 'bg-blue-500',   text: 'text-blue-600',   dot: 'bg-blue-500' },
  processing:       { ring: 'ring-amber-500',  bg: 'bg-amber-500',  text: 'text-amber-600',  dot: 'bg-amber-500' },
  out_for_delivery: { ring: 'ring-violet-500', bg: 'bg-violet-500', text: 'text-violet-600', dot: 'bg-violet-500' },
  delivered:        { ring: 'ring-emerald-500',bg: 'bg-emerald-500',text: 'text-emerald-600',dot: 'bg-emerald-500' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod:           'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  esewa:         'eSewa',
  khalti:        'Khalti',
};

type OrderStatus = 'received' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

const PIPELINE_ORDER = ['received', 'processing', 'out_for_delivery', 'delivered'] as const;
type PipelineStep = typeof PIPELINE_ORDER[number];

export default function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>((order.status ?? 'received') as OrderStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    if (newStatus === 'cancelled' && !confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setConfirmCancel(false);

    setLoading(true);
    setError(null);
    const prev = status;
    setStatus(newStatus as OrderStatus);

    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);

    if (!res.ok) {
      setStatus(prev);
      setError('Failed to update status. Please try again.');
      return;
    }

    router.refresh();
  };

  const items = (order.items as unknown as OrderItem[]) ?? [];
  const subtotal = Number(order.subtotal ?? 0);
  const delivery = Number(order.delivery_charge ?? 0);
  const total    = Number(order.total ?? 0);

  const waNumber  = order.customer_phone?.replace(/\D/g, '');
  const waMessage = encodeURIComponent(
    `Hi ${order.customer_name}, your order ${order.order_number} is now ${status.replace(/_/g, ' ')}. Thank you for shopping with Panchamul Bijuli!`
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order #{order.order_number}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp customer */}
          {waNumber && (
            <a
              href={`https://wa.me/977${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700 ring-1 ring-green-200 hover:bg-green-100 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Cancel confirmation */}
      {confirmCancel && (
        <div className="mb-6 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
          <p className="font-semibold text-red-800 mb-1">Cancel this order?</p>
          <p className="text-sm text-red-600 mb-4">This will mark the order as cancelled. This action can be undone by changing the status again.</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Yes, cancel order
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Keep order
            </button>
          </div>
        </div>
      )}

      {/* ── Order Status Pipeline ── */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">Order Status</h2>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
              Updating…
            </span>
          )}
        </div>

        {/* Main pipeline: Received → Processing → Out for Delivery → Delivered */}
        <div className="flex items-start gap-0">
          {PIPELINE_STEPS.map((step, i) => {
            const pipelineIdx   = PIPELINE_ORDER.indexOf(step.value as PipelineStep);
            const currentIdx    = status === 'cancelled' ? -1 : PIPELINE_ORDER.indexOf(status as PipelineStep);
            const isActive      = status === step.value;
            const isCompleted   = currentIdx > pipelineIdx;
            const isFuture      = currentIdx < pipelineIdx && status !== 'cancelled';
            const colors        = STEP_COLORS[step.value];
            const isLast        = i === PIPELINE_STEPS.length - 1;

            return (
              <div key={step.value} className="flex items-start flex-1 min-w-0">
                {/* Step node */}
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <button
                    onClick={() => handleStatusChange(step.value)}
                    disabled={loading}
                    title={step.desc}
                    className={[
                      'relative flex flex-col items-center gap-2 w-full px-2 py-3 rounded-xl transition-all duration-200 group',
                      'disabled:cursor-not-allowed',
                      isActive
                        ? `ring-2 ${colors.ring} bg-slate-50`
                        : isCompleted
                        ? 'hover:bg-slate-50'
                        : isFuture
                        ? 'opacity-40 hover:opacity-60 hover:bg-slate-50'
                        : 'hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {/* Circle indicator */}
                    <span
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all duration-300 text-sm font-bold',
                        isActive
                          ? `${colors.bg} ring-transparent text-white shadow-lg`
                          : isCompleted
                          ? `bg-slate-800 ring-transparent text-white`
                          : 'bg-slate-100 ring-slate-200 text-slate-400',
                      ].join(' ')}
                    >
                      {isCompleted ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <span className={`h-2.5 w-2.5 rounded-full bg-white`} />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                    </span>

                    {/* Label */}
                    <div className="text-center">
                      <p className={`text-xs font-semibold leading-tight ${
                        isActive ? colors.text : isCompleted ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{step.desc}</p>
                    </div>
                  </button>
                </div>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex items-center self-start pt-[18px] px-0.5 shrink-0">
                    <svg
                      className={`h-4 w-4 transition-colors duration-300 ${
                        currentIdx > i ? 'text-slate-700' : 'text-slate-200'
                      }`}
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider with downward branch indicator */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] uppercase tracking-widest text-slate-300 font-medium">or</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Cancel branch */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={loading || status === 'delivered'}
            className={[
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium ring-1 transition-all duration-200',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              status === 'cancelled'
                ? 'bg-red-500 text-white ring-red-500 shadow-md'
                : 'bg-red-50 text-red-600 ring-red-200 hover:bg-red-100',
            ].join(' ')}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {status === 'cancelled' ? 'Cancelled' : 'Cancel Order'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">
              Order Items
              <span className="ml-2 text-sm font-normal text-slate-400">({items.length})</span>
            </h2>
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <div
                  key={`${item.product_id}-${index}`}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {item.quantity}×
                    </span>
                    <span className="font-medium text-slate-800 truncate">
                      {item.name_en || item.product_name || item.name || `Item ${index + 1}`}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {formatPrice((item.unit_price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
              {subtotal > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span>{delivery > 0 ? formatPrice(delivery) : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: customer + payment */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">Customer</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block text-xs uppercase tracking-wide mb-0.5">Name</span>
                <p className="font-semibold text-slate-900">{order.customer_name}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase tracking-wide mb-0.5">Phone</span>
                <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                  {order.customer_phone}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase tracking-wide mb-0.5">Delivery Address</span>
                <p className="font-medium text-slate-900">
                  {order.delivery_address}
                  {order.delivery_city && <span className="text-slate-500">, {order.delivery_city}</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4">Payment</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block text-xs uppercase tracking-wide mb-0.5">Method</span>
                <p className="font-semibold text-slate-900">
                  {PAYMENT_LABELS[order.payment_method ?? ''] ?? order.payment_method ?? '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase tracking-wide mb-0.5">Order Date</span>
                <p className="font-medium text-slate-900">
                  {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
              <h2 className="text-sm font-bold text-amber-800 mb-2">Customer Notes</h2>
              <p className="text-sm text-amber-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
