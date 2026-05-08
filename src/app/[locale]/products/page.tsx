import { createPublicClient } from '@/lib/supabase/server';
import ProductsPageClient from './ProductsPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Panchamul Bijuli',
  description: 'Browse our complete collection of electrical products.',
};

// force-dynamic because URL searchParams change the results
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = createPublicClient();

  const page = Number(params.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0; // 0 = no upper limit

  // Build products query — join categories so we get name_en/slug inline,
  // avoiding a separate sequential category slug→id lookup
  let productsQuery = supabase
    .from('products')
    .select('*, categories!inner(id, name_en, name_np, slug)', { count: 'exact' })
    .eq('is_active', true);

  // Filter by category slug directly via the join (no extra round-trip)
  if (params.category) {
    productsQuery = productsQuery.eq('categories.slug', params.category);
  }
  if (params.brand) {
    productsQuery = productsQuery.eq('brand', params.brand);
  }
  if (params.search) {
    productsQuery = productsQuery.or(
      `name_en.ilike.%${params.search}%,name_np.ilike.%${params.search}%`
    );
  }
  if (minPrice > 0) {
    productsQuery = productsQuery.gte('price', minPrice);
  }
  if (maxPrice > 0) {
    productsQuery = productsQuery.lte('price', maxPrice);
  }

  productsQuery = productsQuery
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  // All three queries run in parallel — no sequential waterfall
  const [
    { data: categories },
    { data: products, count },
    { data: brandRows },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    productsQuery,
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
      products={products || []}
      categories={categories || []}
      brands={brands}
      totalCount={count || 0}
      currentPage={page}
      perPage={perPage}
      initialCategory={params.category || null}
      initialBrand={params.brand || null}
      initialSearch={params.search || ''}
      initialMinPrice={minPrice}
      initialMaxPrice={maxPrice}
    />
  );
}