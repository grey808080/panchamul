import { createPublicClient } from '@/lib/supabase/server';
import GalleryClient from './GalleryClient';
import type { Tables } from '@/types/database';
type GalleryItem = Tables<'gallery'>;

export const revalidate = 3600;

export default async function GalleryPage() {
  const supabase = createPublicClient();

  const { data: items } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true });

  return <GalleryClient items={items || []} />;
}