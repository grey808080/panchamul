import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { formatPrice } from '@/lib/utils/formatPrice';

const statusSteps = ['received', 'processing', 'out_for_delivery', 'delivered'];

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations('orders');

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, name_np, images))')
    .eq('order_number', id)
    .single();

  if (error || !order) notFound();

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('confirmed')}</h1>
          <p className="mt-1 text-slate-500">{t('orderNumber')}: <span className="font-mono font-bold text-primary">{order.order_number}</span></p>
        </div>

        {/* Status Timeline */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">{t('status')}</h2>
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  i <= currentStep ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-400'
                }`}>
                  {i <= currentStep ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{i + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium text-center ${i <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
                  {t(`status_${step}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('details')}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">{t('customerName')}</span><p className="font-medium">{order.customer_name}</p></div>
            <div><span className="text-slate-500">{t('phone')}</span><p className="font-medium">{order.customer_phone}</p></div>
            <div><span className="text-slate-500">{t('address')}</span><p className="font-medium">{order.customer_address}</p></div>
            <div><span className="text-slate-500">{t('payment')}</span><p className="font-medium capitalize">{order.payment_method}</p></div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('items')}</h2>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{item.products?.name}</p>
                  <p className="text-sm text-slate-500">× {item.quantity}</p>
                </div>
                <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-lg font-bold">
            <span>{t('total')}</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
