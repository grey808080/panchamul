import { createPublicClient } from '@/lib/supabase/server';
import ElectriciansClient from './ElectriciansClient';
import { getTranslations } from 'next-intl/server';
import { PhoneIcon } from '@heroicons/react/24/outline';

export const revalidate = 3600;

export default async function ElectriciansPage() {
  const t = await getTranslations('electricians');
  const supabase = createPublicClient();

  const { data: electricians } = await supabase
    .from('electricians')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero header — dark industrial ── */}
      <div className="relative overflow-hidden bg-surface-bg">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Orange glow */}
        <div
          className="absolute top-0 right-0 h-64 w-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-slate-300 leading-relaxed max-w-xl">
              {t('subtitle')}
            </p>

          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* ── Electricians grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <ElectriciansClient electricians={electricians || []} />
      </section>

      {/* ── CTA section ── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary/10 mb-4">
                  <PhoneIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                  Need an Electrician Now?
                </h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Call our store directly and we'll connect you with the right electrician for your job.
                </p>
                <a
                  href="tel:+9779849401009"
                  className="inline-flex items-center gap-2 rounded border border-primary bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call +977-9849401009
                </a>
              </div>

              {/* Right */}
              <div className="p-8 bg-slate-50">
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">
                  What Our Electricians Do
                </h3>
                <ul className="space-y-2.5">
                  {[
                    'House wiring & rewiring',
                    'MCB & distribution board installation',
                    'Solar panel installation',
                    'Fan & light fitting',
                    'Fault finding & repairs',
                    'Industrial electrical work',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
