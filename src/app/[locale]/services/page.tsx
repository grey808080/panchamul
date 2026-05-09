import { createPublicClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { WrenchScrewdriverIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';

export const revalidate = 3600;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('services');
  const supabase = createPublicClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-white">

      {/* ── Dark hero header — matches all other pages ── */}
      <div className="relative overflow-hidden bg-surface-bg">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-0 right-0 h-64 w-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1.5">
              <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                {t('badge')}
              </span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-slate-300 leading-relaxed max-w-xl">{t('subtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* ── Services grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {!services || services.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <span className="mb-3 block text-4xl">🛠️</span>
            <h2 className="font-heading text-xl font-bold text-slate-800">{t('noServices')}</h2>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group rounded-lg border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-primary hover:shadow-md"
              >
                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xl transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                  {service.icon || '⚡'}
                </div>

                {/* Title */}
                <h2 className="font-heading text-base font-bold text-slate-900 mb-2">
                  {locale === 'np' && service.title_np ? service.title_np : service.title_en}
                </h2>

                {/* Description */}
                {(locale === 'np' && service.description_np
                  ? service.description_np
                  : service.description_en) && (
                  <p className="text-sm leading-relaxed text-slate-500">
                    {locale === 'np' && service.description_np
                      ? service.description_np
                      : service.description_en}
                  </p>
                )}

                {/* Orange bottom indicator */}
                <div className="mt-4 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA section — matches about/electricians pattern ── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Visit store */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary/10 mb-4">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                  {t('visitStore')}
                </h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  {t('ctaTitle')}
                </p>
                <a
                  href="https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-primary bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
                >
                  <MapPinIcon className="h-4 w-4" />
                  {t('openMaps')}
                </a>
              </div>

              {/* Call us */}
              <div className="p-8 bg-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary/10 mb-4">
                  <PhoneIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                  Call for a Quote
                </h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Not sure which service you need? Call us and we'll guide you.
                </p>
                <a
                  href="tel:+9779849401009"
                  className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-primary hover:text-primary transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  +977-9849401009
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
