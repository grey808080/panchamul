'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheckIcon, TruckIcon, BoltIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function TrustBadges() {
  const t = useTranslations('home');

  const badges = [
    { icon: BoltIcon,        title: t('trust1Title'), desc: t('trust1Desc') },
    { icon: TruckIcon,       title: t('trust2Title'), desc: t('trust2Desc') },
    { icon: ShieldCheckIcon, title: t('trust3Title'), desc: t('trust3Desc') },
    { icon: UserGroupIcon,   title: t('trust4Title'), desc: t('trust4Desc') },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4">
        {/*
          Mobile: 2-col grid with both x and y dividers
          Desktop: 4-col single row with only x dividers
        */}
        <div className="grid grid-cols-2 md:grid-cols-4
          divide-y divide-x divide-slate-200
          md:divide-y-0
        ">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5 transition-colors hover:bg-white"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                <badge.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs sm:text-sm font-bold text-slate-800 leading-tight">{badge.title}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight hidden sm:block">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
