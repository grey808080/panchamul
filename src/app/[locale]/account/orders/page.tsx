'use client';

import { useTranslations } from 'next-intl';

export default function AccountOrdersPage() {
  const t = useTranslations('account');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('myOrders')}</h1>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/60 text-center">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-slate-100">
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{t('noOrders')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('loginToSeeOrders')}</p>
        </div>
      </div>
    </div>
  );
}
