import { Suspense } from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import ProductsPageClient from './ProductsPageClient';
import ProductResults from './ProductResults';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Panchamul Bijuli',
  description: 'Browse our complete collection of electrical products.',
};

// Categories and brands are stable reference data — cache for 1 hour.
// Only the product results are dynamic (depend on searchParams).
export const revalidate = 3600;

interface SearchParams {
  category?: string;
  brand?: string;
  search?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = createPublicClient();

  // Fetch stable reference data — categories and brands.
  // These are cached and render immediately, giving the user
  // a fully interactive shell (search, filters, tabs) before
  // the product results arrive.
  const [{ data: categories }, { data: brandRows }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null)
      .order('brand'),
  ]);

  const brands = [
    ...new Set(brandRows?.map((r) => r.brand).filter(Boolean) as string[]),
  ];

  return (
    <ProductsPageClient
      categories={categories || []}
      brands={brands}
      initialCategory={params.category || null}
      initialBrand={params.brand || null}
      initialSearch={params.search || ''}
    >
      {/*
        ProductResults is an async Server Component that fetches products
        based on the current searchParams. It streams in independently —
        the shell above is already interactive while this loads.
      */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={
          <div>
            <div className="mb-4 h-4 w-28 rounded bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-4/5 rounded bg-slate-200" />
                    <div className="h-5 w-24 rounded bg-slate-200 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ProductResults searchParams={params} />
      </Suspense>
    </ProductsPageClient>
  );
}
