import { createPublicClient } from '@/lib/supabase/server';
import HeroBanner from '@/components/home/HeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProductsClient from '@/components/home/FeaturedProductsClient';
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

  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true)
      .order('created_at', { ascending: false }).limit(8),
  ]);

  return (
    <div>
      {/* 1. Hero — full viewport height */}
      <HeroBanner />

      {/* 2. Trust strip */}
      <TrustBadges />

      {/* 3. Categories */}
      <CategoryGrid categories={categories || []} />

      {/* 4. Featured products */}
      <FeaturedProductsClient products={featured || []} />

      {/* 5. CTA strip — dark, bridges into footer */}
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
