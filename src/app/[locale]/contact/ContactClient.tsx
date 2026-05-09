'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPinIcon, PhoneIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

const MAP_URL = 'https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z';

export default function ContactClient() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: MapPinIcon,   label: t('address'), value: 'Panchamul Bijuli Bhandar, Kohalpur, Banke, Nepal' },
    { icon: PhoneIcon,    label: t('phone'),   value: '+977-9849401009', href: 'tel:+9779849401009' },
    { icon: EnvelopeIcon, label: t('email'),   value: 'panchamulbijuli@gmail.com', href: 'mailto:panchamulbijuli@gmail.com' },
    { icon: ClockIcon,    label: t('hours'),   value: t('hoursDetail') },
  ];

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
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Get in Touch</span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-slate-300 leading-relaxed">{t('subtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-primary/20 bg-primary/5">
                  <info.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-sm font-medium text-slate-800 hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
            >
              <MapPinIcon className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-700">
                  {t('sendMessage')}
                </h2>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-slate-900">{t('thankYou')}</h2>
                  <p className="mt-2 text-sm text-slate-500">{t('willReply')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {[
                    { field: 'name',    type: 'text',  label: t('name'),  required: true },
                    { field: 'phone',   type: 'tel',   label: t('phone'), required: false },
                    { field: 'email',   type: 'email', label: t('email'), required: false },
                  ].map(({ field, type, label, required }) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        required={required}
                        className="input-field"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="label">{t('message')}</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      required
                      className="input-field resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">{t('send')}</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
