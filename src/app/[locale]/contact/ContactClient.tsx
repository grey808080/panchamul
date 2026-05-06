'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPinIcon, PhoneIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export default function ContactClient() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to API or Supabase
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: MapPinIcon, label: t('address'), value: 'Kohalpur, Banke, Nepal', color: 'text-primary' },
    { icon: PhoneIcon, label: t('phone'), value: '+977-XXXXXXXXXX', color: 'text-green-600' },
    { icon: EnvelopeIcon, label: t('email'), value: 'info@panchamulbijuli.com', color: 'text-amber-600' },
    { icon: ClockIcon, label: t('hours'), value: t('hoursDetail'), color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-primary to-primary-dark py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-blue-200/80">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                <info.icon className={`h-6 w-6 mt-0.5 ${info.color}`} />
                <div>
                  <p className="font-semibold text-slate-800">{info.label}</p>
                  <p className="text-sm text-slate-500">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              {submitted ? (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-4">✅</span>
                  <h2 className="text-xl font-bold text-slate-800">{t('thankYou')}</h2>
                  <p className="mt-2 text-slate-500">{t('willReply')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">{t('sendMessage')}</h2>
                  {['name', 'phone', 'email'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t(field)}</label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        value={form[field as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        required={field !== 'email'}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('message')}</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
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
