import { createPublicClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Professional electrical services in Kohalpur. We offer wiring, installation, repair, and solar services.',
};

export const revalidate = 3600;

export default async function ServicesPage() {
  const supabase = createPublicClient();
  const t = await getTranslations('services');

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  const serviceIcons: Record<string, string> = {
    'wiring': '🔌', 'installation': '⚡', 'repair': '🔧',
    'solar': '☀️', 'consultation': '📋', 'default': '💡',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-primary to-primary-dark py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-blue-200/80">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(services || []).map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-2xl shadow-md mb-4 group-hover:scale-110 transition-transform">
                {serviceIcons[service.slug] || serviceIcons.default}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{service.name}</h3>
              {service.name_np && (
                <p className="text-sm text-slate-500">{service.name_np}</p>
              )}
              {service.description && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{service.description}</p>
              )}
              {service.price_range && (
                <p className="mt-3 text-sm font-semibold text-primary">{service.price_range}</p>
              )}
            </div>
          ))}
        </div>

        {(!services || services.length === 0) && (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔧</span>
            <h2 className="text-xl font-semibold text-slate-700">{t('noServices')}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
