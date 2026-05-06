import { createPublicClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import ElectriciansClient from './ElectriciansClient';

export const revalidate = 3600;

export default async function ElectriciansPage() {
  const supabase = createPublicClient();
  const t = await getTranslations('electricians');

  const { data: electricians } = await supabase
    .from('electricians')
    .select('*')
    .eq('active', true)
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-primary to-primary-dark py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-blue-200/80">{t('subtitle')}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ElectriciansClient electricians={electricians || []} />
      </div>
    </div>
  );
}
