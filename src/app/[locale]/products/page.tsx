import { createPublicClient } from '@/lib/supabase/server';
import { useTranslations } from 'next-intl';
import ProductsPageClient from './ProductsPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our complete collection of electrical products, including wires, switches, lighting, and appliances.',
};

export const revalidate = 3600; // Cache for 1 hour

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = createPublicClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  // Build products query
  let query = supabase
    .from('products')
    .select('*, categories(name, name_np, slug)', { count: 'exact' })
    .eq('active', true);

  if (params.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (params.brand) {
    query = query.eq('brand', params.brand);
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,name_np.ilike.%${params.search}%`);
  }

  const page = Number(params.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;

  query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  query = query.range(from, from + perPage - 1);

  const { data: products, count } = await query;

  // Get unique brands
  const { data: brandRows } = await supabase
    .from('products')
    .select('brand')
    .eq('active', true)
    .not('brand', 'is', null)
    .order('brand');

  const brands = [...new Set(brandRows?.map((r) => r.brand).filter(Boolean) as string[])];

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
