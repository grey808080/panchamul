'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

export default function AccountPage() {
  const t = useTranslations('account');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('title')}</h1>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('profile')}</h2>
            <p className="text-slate-500 text-sm mb-4">{t('loginPrompt')}</p>
            <div className="flex gap-3">
              <Button variant="primary">{t('login')}</Button>
              <Button variant="outline">{t('register')}</Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('quickLinks')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href="/account/orders" className="flex items-center gap-3 rounded-xl p-4 hover:bg-slate-50 ring-1 ring-slate-100 transition-colors">
                <span className="text-2xl">📦</span>
                <div><p className="font-medium text-slate-800">{t('myOrders')}</p><p className="text-sm text-slate-500">{t('trackOrders')}</p></div>
              </Link>
              <Link href="/products" className="flex items-center gap-3 rounded-xl p-4 hover:bg-slate-50 ring-1 ring-slate-100 transition-colors">
                <span className="text-2xl">🛒</span>
                <div><p className="font-medium text-slate-800">{t('shopNow')}</p><p className="text-sm text-slate-500">{t('browseProducts')}</p></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
