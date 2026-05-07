import { getTranslations } from 'next-intl/server';
import { BoltIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Panchamul Bijuli, serving Kohalpur and Banke district with quality electrical products and services since 2010.',
};

export default async function AboutPage() {
  const t = await getTranslations('about');
  const mapUrl =
    'https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z/data=!3m1!4b1!4m6!3m5!1s0x39986fa9a7aa7f9f:0xc7a8dcc50b9d2fd1!8m2!3d28.1977792!4d81.7001386!16s%2Fg%2F11rf6r7b9p?hl=en-US&entry=ttu';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
            <BoltIcon className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-white md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-blue-200/80 max-w-2xl mx-auto">{t('tagline')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 space-y-16">
        {/* Story */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('storyTitle')}</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">{t('story1')}</p>
            <p className="text-slate-600 leading-relaxed mt-4">{t('story2')}</p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('valuesTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {['quality', 'trust', 'service'].map((val) => (
              <div key={val} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 text-center">
                <span className="text-3xl block mb-3">{val === 'quality' ? '🏆' : val === 'trust' ? '🤝' : '⚡'}</span>
                <h3 className="font-bold text-slate-800">{t(`value_${val}_title`)}</h3>
                <p className="mt-2 text-sm text-slate-500">{t(`value_${val}_desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('visitUs')}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{t('address')}</p>
                <p className="text-sm text-slate-500">Panchamul Bijuli Bhandar, Kohalpur, Banke, Nepal</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{t('phone')}</p>
                <p className="text-sm text-slate-500">+977-9849401009</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{t('hours')}</p>
                <p className="text-sm text-slate-500">{t('hoursDetail')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('locationTitle')}</h2>
          <div className="mb-4">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary"
            >
              <MapPinIcon className="h-4 w-4" />
              Open on Google Maps
            </a>
          </div>
          <div className="aspect-video rounded-2xl bg-slate-200 overflow-hidden ring-1 ring-slate-200/60">
            <iframe
              src="https://www.google.com/maps?q=28.1977792,81.7001386&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
