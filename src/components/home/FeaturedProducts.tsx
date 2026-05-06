import { createPublicClient } from '@/lib/supabase/server';
import FeaturedProductsClient from './FeaturedProductsClient';

export default async function FeaturedProducts() {
  const supabase = createPublicClient();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return <FeaturedProductsClient products={products || []} />;
}