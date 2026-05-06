'use client';

import Image from 'next/image';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import type { Electrician } from '@/types/database';

interface ElectricianCardProps {
  electrician: Electrician;
}

export default function ElectricianCard({ electrician }: ElectricianCardProps) {
  const t = useTranslations('electricians');
  const waNumber = electrician.phone?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark">
          {electrician.photo_url ? (
            <Image src={electrician.photo_url} alt={electrician.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-white font-bold">
              {electrician.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{electrician.name}</h3>
          <Badge variant={electrician.available ? 'success' : 'default'}>
            {electrician.available ? t('available') : t('unavailable')}
          </Badge>
        </div>
      </div>

      {electrician.specialties && electrician.specialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {electrician.specialties.map((spec) => (
            <span key={spec} className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              {spec}
            </span>
          ))}
        </div>
      )}

      {electrician.experience_years && (
        <p className="mt-3 text-sm text-slate-500">
          {t('experience', { years: electrician.experience_years })}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {electrician.phone && (
          <a
            href={`tel:${electrician.phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/5 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <PhoneIcon className="h-4 w-4" />
            {t('call')}
          </a>
        )}
        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-50 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
