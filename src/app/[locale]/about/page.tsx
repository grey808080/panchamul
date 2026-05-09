import { getTranslations } from 'next-intl/server';
import { BoltIcon, MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Panchamul Bijuli',
  description: 'Learn about Panchamul Bijuli, serving Kohalpur and Banke district with quality electrical products and services since 2010.',
};

export const revalidate = false;

const MAP_URL = 'https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z';

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="min-h-screen bg-white">

      {/* ── Dark hero header ── */}
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
              <BoltIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Since 2010</span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-slate-300 leading-relaxed max-w-xl">{t('tagline')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-12">

        {/* Story */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Our Story</p>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-5">{t('storyTitle')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <p className="text-sm text-slate-600 leading-relaxed">{t('story1')}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{t('story2')}</p>
          </div>
        </section>

        {/* Values */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">What We Stand For</p>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">{t('valuesTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: 'quality', icon: '🏆' },
              { key: 'trust',   icon: '🤝' },
              { key: 'service', icon: '⚡' },
            ].map(({ key, icon }) => (
              <div key={key} className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-md">
                <span className="text-2xl block mb-3">{icon}</span>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-1">{t(`value_${key}_title`)}</h3>
                <p className="text-sm text-slate-500">{t(`value_${key}_desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Find Us</p>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">{t('visitUs')}</h2>
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {[
                { icon: MapPinIcon, label: t('address'), value: 'Panchamul Bijuli Bhandar, Kohalpur, Banke, Nepal' },
                { icon: PhoneIcon,  label: t('phone'),   value: '+977-9849401009' },
                { icon: ClockIcon,  label: t('hours'),   value: t('hoursDetail') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-primary/20 bg-primary/5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">Location</p>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-5">{t('locationTitle')}</h2>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="aspect-video">
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
          </div>
          <div className="mt-3">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
            >
              <MapPinIcon className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
