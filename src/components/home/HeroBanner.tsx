'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HeroBanner() {
  const t = useTranslations('home');

  return (
    <section
      className="
        relative overflow-hidden bg-surface-bg
        flex items-center
        sm:min-h-[calc(100vh-56px)]

      "
    >
      {/* ── Background: orange grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,0,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,0,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Background: orange radial glow bottom-left ── */}
      <div
        className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 65%)' }}
      />

      {/* ── Background: top-right glow ── */}
      <div
        className="absolute -top-20 right-0 h-80 w-80 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)' }}
      />

      {/* ── Right image panel — desktop only ── */}
      <div className="absolute inset-y-0 right-0 w-[45%] hidden lg:block pointer-events-none">
        {/* Left-to-right gradient mask — blends image into dark bg */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, #0D0D0D 0%, rgba(13,13,13,0.6) 35%, rgba(13,13,13,0.1) 100%)',
          }}
        />
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'url(/hero-electrician.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundColor: '#141414',
          }}
        >
          {/* Fallback SVG when no photo */}
          <div className="h-full w-full flex items-center justify-center">
            <svg viewBox="0 0 320 400" className="w-72 opacity-[0.06]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="40" width="240" height="320" rx="4" stroke="#FF6B00" strokeWidth="2"/>
              <rect x="60" y="70" width="200" height="20" rx="2" fill="#FF6B00" opacity="0.4"/>
              {[110, 140, 170, 200, 230, 260, 290].map((y, i) => (
                <g key={i}>
                  <rect x="70"  y={y} width="40" height="16" rx="2" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5"/>
                  <rect x="120" y={y} width="40" height="16" rx="2" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5"/>
                  <rect x="170" y={y} width="40" height="16" rx="2" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5"/>
                  <rect x="220" y={y} width="40" height="16" rx="2" stroke="#FF6B00" strokeWidth="1.5" opacity="0.5"/>
                </g>
              ))}
              <path d="M155 160 L140 195 L155 195 L145 230 L170 190 L153 190 L165 160Z" fill="#FF6B00" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-20 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
        <div className="max-w-lg lg:max-w-xl">

          {/* Headline */}
          <h1 className="font-heading font-bold leading-[1.08] text-white
            text-[clamp(2rem,6vw,3.75rem)]
          ">
            {t('headline')}
          </h1>

          {/* Subheadline */}
          <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-sm sm:max-w-md">
            {t('subheadline')}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3 pb-12sm:pb-0">
            <Link href="/products">
              <button className="btn-primary text-xs uppercase tracking-wider px-6 py-3 min-w-[130px]">
                {t('shopNow')}
              </button>
            </Link>
            <Link href="/electricians">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.98] min-w-[130px]">
                {t('findElectrician')}
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 max-w-xs sm:max-w-smi">
            {[
              { value: '15+',   label: t('yearsExp') },
              { value: '500+',  label: t('productsCount') },
              { value: '1000+', label: t('happyCustomers') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider mt-0.5 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
}
