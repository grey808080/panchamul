import { createPublicClient } from '@/lib/supabase/server';
import GalleryClient from './GalleryClient';
import { getTranslations } from 'next-intl/server';
import type { Tables } from '@/types/database';
type GalleryItem = Tables<'gallery'>;

export const revalidate = 3600;

export default async function GalleryPage() {
  const t = await getTranslations('gallery');
  const supabase = createPublicClient();

  const { data: items } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-primary to-primary-dark px-4 py-14">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-bold text-white md:text-5xl">{t('title')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-blue-100/90 md:text-lg">{t('subtitle')}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <GalleryClient items={items || []} />
      </section>
    </div>
  );
}