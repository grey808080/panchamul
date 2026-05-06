'use client';

import { useTranslations } from 'next-intl';
import ElectricianCard from '@/components/electricians/ElectricianCard';
import type { Tables } from '@/types/database';
type Electrician = Tables<'electricians'>;

interface ElectriciansClientProps {
  electricians: Electrician[];
}

export default function ElectriciansClient({ electricians }: ElectriciansClientProps) {
  const t = useTranslations('electricians');

  if (electricians.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">👷</span>
        <h2 className="text-xl font-semibold text-slate-700">{t('noElectricians')}</h2>
        <p className="mt-1 text-slate-500">{t('comingSoon')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {electricians.map((elec) => (
        <ElectricianCard key={elec.id} electrician={elec} />
      ))}
    </div>
  );
}
