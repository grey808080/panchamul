import { createClient } from '@/lib/supabase/server';
import ElectriciansClient from './ElectriciansClient';

export const revalidate = 3600;

export default async function ElectriciansPage() {
  const supabase = await createClient();

  const { data: electricians } = await supabase
    .from('electricians')
    .select('*')
    .order('display_order', { ascending: true });

  return <ElectriciansClient electricians={electricians || []} />;
}