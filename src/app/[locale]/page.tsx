import { createPublicClient } from '@/lib/supabase/server';
import HeroBanner from '@/components/home/HeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProductsClient from '@/components/home/FeaturedProductsClient';
import { setRequestLocale } from 'next-intl/server';

// Remove revalidate — let each locale cache separately
export const dynamic = 'force-dynamic';

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

  console.log('PAGE LOCALE:', locale); // debug — remove after confirmed

  return (
    <div>
      <HeroBanner />
      <TrustBadges />
      <FeaturedProductsClient products={featured || []} />
      <CategoryGrid />
    </div>
  );
}