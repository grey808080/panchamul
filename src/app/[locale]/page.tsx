import { createPublicClient } from '@/lib/supabase/server';
import HeroBanner from '@/components/home/HeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProductsClient from '@/components/home/FeaturedProductsClient';
import { setRequestLocale } from 'next-intl/server';

// Revalidate every 5 minutes — balances freshness with caching.
// Each locale is cached independently by Next.js since locale is a route segment.
export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Tell next-intl which locale this page is for
  setRequestLocale(locale);

  const supabase = createPublicClient();

  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);


  return (
    <div>
      <HeroBanner />
      <TrustBadges />
      <FeaturedProductsClient products={featured || []} />
      <CategoryGrid categories={categories || []} />
    </div>
  );
}