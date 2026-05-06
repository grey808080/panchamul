'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function HeroBanner() {
  const t = useTranslations('home');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-slate-900 min-h-[600px] flex items-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-secondary animate-float" />
        <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-primary-light animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 right-40 h-48 w-48 rounded-full bg-secondary-light animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md ring-1 ring-white/20 animate-fade-in">
            <BoltIcon className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-white/90">{t('badge')}</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('headline')}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-blue-100/80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {t('subheadline')}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link href="/products">
              <Button size="lg" className="bg-secondary hover:bg-secondary-light text-slate-900 font-bold shadow-lg shadow-secondary/30">
                {t('shopNow')}
              </Button>
            </Link>
            <Link href="/electricians">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {t('findElectrician')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            {[
              { value: '15+', label: t('yearsExp') },
              { value: '500+', label: t('productsCount') },
              { value: '1000+', label: t('happyCustomers') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-secondary">{stat.value}</p>
                <p className="text-sm text-blue-200/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
