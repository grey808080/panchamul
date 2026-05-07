import { createPublicClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { WrenchScrewdriverIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-primary to-primary-dark px-4 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:items-center sm:text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <WrenchScrewdriverIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">{t('title')}</h1>
            <p className="mt-3 max-w-2xl text-blue-100/90 md:text-lg">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {!services || services.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mb-3 block text-5xl">🛠️</span>
            <h2 className="text-xl font-semibold text-slate-800">{t('noServices')}</h2>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl text-primary">
                  {service.icon || '⚡'}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {locale === 'np' && service.title_np ? service.title_np : service.title_en}
                </h2>
                {(locale === 'np' && service.description_np ? service.description_np : service.description_en) && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {locale === 'np' && service.description_np ? service.description_np : service.description_en}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-300">{t('visitStore')}</p>
              <h3 className="mt-1 text-xl font-semibold">{t('ctaTitle')}</h3>
            </div>
            <a
              href="https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z/data=!3m1!4b1!4m6!3m5!1s0x39986fa9a7aa7f9f:0xc7a8dcc50b9d2fd1!8m2!3d28.1977792!4d81.7001386!16s%2Fg%2F11rf6r7b9p?hl=en-US&entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <MapPinIcon className="h-4 w-4" />
              {t('openMaps')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}