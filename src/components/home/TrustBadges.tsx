'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheckIcon, TruckIcon, BoltIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function TrustBadges() {
  const t = useTranslations('home');

  const badges = [
    { icon: BoltIcon, title: t('trust1Title'), desc: t('trust1Desc'), color: 'from-blue-500 to-primary' },
    { icon: TruckIcon, title: t('trust2Title'), desc: t('trust2Desc'), color: 'from-green-500 to-emerald-600' },
    { icon: ShieldCheckIcon, title: t('trust3Title'), desc: t('trust3Desc'), color: 'from-amber-500 to-secondary' },
    { icon: UserGroupIcon, title: t('trust4Title'), desc: t('trust4Desc'), color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-lg mb-4 transition-transform group-hover:scale-110`}>
                <badge.icon className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 md:text-base">{badge.title}</h3>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
