import { createPublicClient } from '@/lib/supabase/server';
import ProductsPageClient from './ProductsPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Panchamul Bijuli',
  description: 'Browse our complete collection of electrical products.',
};

export const revalidate = 3600;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createPublicClient();

  const page = Number(params.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;

  // Resolve category slug → id first if needed
  let categoryId: string | null = null;
  if (params.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    categoryId = cat?.id ?? null;
  }

  // Build products query
  let productsQuery = supabase
    .from('products')
    .select('*, categories(name_en, name_np, slug)', { count: 'exact' })
    .eq('is_active', true);

  if (categoryId) productsQuery = productsQuery.eq('category_id', categoryId);
  if (params.brand) productsQuery = productsQuery.eq('brand', params.brand);
  if (params.search) {
    productsQuery = productsQuery.or(
      `name_en.ilike.%${params.search}%,name_np.ilike.%${params.search}%`
    );
  }

  productsQuery = productsQuery
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  // Run categories, products, brands all in parallel
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
    />
  );
}