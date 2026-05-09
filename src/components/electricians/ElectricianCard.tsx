'use client';

import Image from 'next/image';
import { PhoneIcon, WrenchScrewdriverIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import type { Tables } from '@/types/database';
type Electrician = Tables<'electricians'>;

interface ElectricianCardProps {
  electrician: Electrician;
}

// WhatsApp SVG icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ElectricianCard({ electrician }: ElectricianCardProps) {
  const t = useTranslations('electricians');
  const waNumber = electrician.whatsapp || electrician.phone?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="group flex flex-col rounded-lg border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-lg">

      {/* Top — availability indicator + photo */}
      <div className="relative bg-slate-900 h-40 overflow-hidden">
        {/* Subtle grid on dark bg */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Photo or initial */}
        {electrician.photo_url ? (
          <Image
            src={electrician.photo_url}
            alt={electrician.name}
            fill
            className="object-cover object-top opacity-80 group-hover:opacity-90 transition-opacity"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10">
              <span className="font-heading text-4xl font-bold text-primary">
                {electrician.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

        {/* Availability badge — top right */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
          electrician.is_available
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            : 'bg-slate-700/60 border border-slate-600 text-slate-400'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${electrician.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          {electrician.is_available ? t('available') : t('unavailable')}
        </div>

        {/* Name on image */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
          <h3 className="font-heading text-lg font-bold text-white leading-tight">{electrician.name}</h3>
          {electrician.experience_years && (
            <p className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5">
              <ClockIcon className="h-3 w-3" />
              {t('experience', { years: electrician.experience_years })}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 gap-3">

        {/* Specialties */}
        {electrician.specialties && electrician.specialties.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <WrenchScrewdriverIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialties</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {electrician.specialties.map((spec) => (
                <span
                  key={spec}
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Phone number — prominent */}
        {electrician.phone && (
          <div className="flex items-center gap-2 rounded border border-slate-100 bg-slate-50 px-3 py-2">
            <PhoneIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono text-sm font-semibold text-slate-800">{electrician.phone}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex gap-2 pt-1">
          {electrician.phone && (
            <a
              href={`tel:${electrician.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-primary bg-primary px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-light"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              {t('call')}
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/977${waNumber.replace(/^977/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded border border-emerald-600 bg-emerald-600 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-500"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
