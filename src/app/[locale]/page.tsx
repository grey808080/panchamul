import { createPublicClient } from '@/lib/supabase/server';
import HeroBanner from '@/components/home/HeroBanner';
import TrendingNow from '@/components/home/TrendingNow';
import RecommendedForYou from '@/components/home/RecommendedForYou';
import FlashDeals from '@/components/home/FlashDeals';
import CategoryGrid from '@/components/home/CategoryGrid';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PhoneIcon } from '@heroicons/react/24/outline';

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = createPublicClient();

  const [
    { data: categories },
    { data: trending },
    { data: deals },
  ] = await Promise.all([
    // Categories for the nav grid
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),

    // Trending: featured products — admin-curated popular items
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(10),

    // Flash deals: products with a discount price
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('compare_price', 0)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="bg-white">

      {/* 1. Hero — compact carousel */}
      <HeroBanner />

      {/* 2. Recommended For You — client-side personalization.
              Reads localStorage, queries Supabase for products in browsed categories.
              Renders nothing on first visit (no history yet). */}
      <RecommendedForYou />

      {/* 3. Trending Now — the primary product discovery section.
              Admin-curated featured products shown prominently. */}
      <TrendingNow products={trending || []} />

      {/* 4. Flash Deals — discounted products with countdown timer */}
      <FlashDeals products={deals || []} />

      {/* 5. Recently Viewed — compact horizontal scroll strip.
              Only renders once user has 2+ viewed products. */}
      <RecentlyViewed />

      {/* 6. Shop by Category — navigation aid, intentionally lower on page */}
      <CategoryGrid categories={categories || []} />

      {/* 7. CTA strip */}
      <section className="bg-surface-bg border-t border-surface-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/electricians"
              className="group flex items-center gap-4 rounded-lg border border-surface-border bg-surface-card p-4 sm:p-5 transition-all hover:border-primary active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-primary/30 bg-primary/10 text-xl transition-colors group-hover:bg-primary group-hover:border-primary">
                👷
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-bold text-ink-primary">Need an Electrician?</p>
                <p className="text-xs text-ink-secondary mt-0.5 truncate">View our certified electricians →</p>
              </div>
            </Link>

            <a
              href="tel:+9779849401009"
              className="group flex items-center gap-4 rounded-lg border border-surface-border bg-surface-card p-4 sm:p-5 transition-all hover:border-primary active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary group-hover:border-primary">
                <PhoneIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-bold text-ink-primary">Call the Store</p>
                <p className="text-xs text-ink-secondary mt-0.5 truncate">+977-9849401009 · Kohalpur →</p>
              </div>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
