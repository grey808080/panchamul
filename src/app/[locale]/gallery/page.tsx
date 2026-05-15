import { createPublicClient } from '@/lib/supabase/server';
import GalleryClient from './GalleryClient';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export default async function GalleryPage() {
  const t = await getTranslations('gallery');
  const supabase = createPublicClient();

  const { data: items } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true });

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
            <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">{t('title')}</h1>
            <p className="mt-3 text-slate-300 leading-relaxed">{t('subtitle')}</p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* ── Gallery content ── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <GalleryClient items={items || []} />
      </section>
    </div>
  );
}
