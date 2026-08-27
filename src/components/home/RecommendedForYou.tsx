'use client';

/**
 * RecommendedForYou — true personalization without any ML infrastructure.
 *
 * Algorithm:
 * 1. Read recently viewed product snapshots from localStorage
 * 2. Extract unique category_ids the user has browsed
 * 3. Query Supabase for active products in those categories, excluding already-seen items
 * 4. Falls back silently if the user has no history (section simply doesn't render)
 *
 * This runs entirely on the client after hydration — zero server cost,
 * fully personalized per-browser session.
 */

import { useEffect, useState } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { SparklesIcon } from '@heroicons/react/24/outline';
import type { Tables } from '@/types/database';
import type { RecentlyViewedItem } from '@/components/home/RecentlyViewed';

type Product = Tables<'products'>;

const STORAGE_KEY = 'panchamul_recently_viewed';

export default function RecommendedForYou() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function fetchRecommended() {
      try {
        // 1. Read viewed items from localStorage
        const viewed: RecentlyViewedItem[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        );

        if (viewed.length === 0) return;

        // 2. Extract unique category_ids & seen product ids
        const categoryIds = [...new Set(
          viewed.map((i) => i.category_id).filter(Boolean) as string[]
        )];
        const seenIds = viewed.map((i) => i.id);

        if (categoryIds.length === 0) return;

        // 3. Query products from those categories, exclude already-seen
        const supabase = createPublicClient();
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .in('category_id', categoryIds)
          .not('id', 'in', `(${seenIds.join(',')})`)
          .order('is_featured', { ascending: false }) // featured first
          .order('created_at', { ascending: false })
          .limit(8);

        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // silently fail — section just won't render
      }
    }

    fetchRecommended();
  }, []);

  // Don't render anything until mounted and we have results
  if (!mounted || products.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Personalized</p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Recommended For You
            </h2>
            <p className="text-xs text-slate-500 mt-1">Based on what you&apos;ve browsed</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
