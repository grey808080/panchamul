'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ElectricianCard from '@/components/electricians/ElectricianCard';
import type { Tables } from '@/types/database';
type Electrician = Tables<'electricians'>;

interface ElectriciansClientProps {
  electricians: Electrician[];
}

export default function ElectriciansClient({ electricians }: ElectriciansClientProps) {
  const t = useTranslations('electricians');
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  if (electricians.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 mb-4">
          <span className="text-3xl">👷</span>
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-800">{t('noElectricians')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('comingSoon')}</p>
      </div>
    );
  }

  const filtered = filter === 'available'
    ? electricians.filter(e => e.is_available)
    : electricians;

  const availableCount = electricians.filter(e => e.is_available).length;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          All ({electricians.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            filter === 'available'
              ? 'bg-emerald-600 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          Available Now ({availableCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-12 text-center">
          <p className="text-slate-500 text-sm">No electricians available right now.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs text-primary hover:underline font-semibold"
          >
            Show all electricians
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((elec) => (
            <ElectricianCard key={elec.id} electrician={elec} />
          ))}
        </div>
      )}
    </div>
  );
}
