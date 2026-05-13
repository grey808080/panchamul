/**
 * ProductResults — async Server Component
 *
 * Fetches the filtered product list based on searchParams and renders
 * the product grid + pagination. Wrapped in <Suspense> by the parent
 * so the shell (header, search, filters) renders immediately while
 * this streams in.
 *
 * The Suspense key={JSON.stringify(params)} in page.tsx ensures a fresh
 * skeleton is shown whenever any filter changes.
 */

import { createPublicClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import ProductPagination from './ProductPagination';

const PER_PAGE = 20;
const MAX_PRICE = 100000;

interface SearchParams {
  category?: string;
  brand?: string;
  search?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function ProductResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createPublicClient();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const from = (page - 1) * PER_PAGE;
  const minPrice = Number(searchParams.minPrice) || 0;
  const maxPrice = Number(searchParams.maxPrice) || 0;

  let query = supabase
    .from('products')
    .select('*, categories!inner(id, name_en, name_np, slug)', { count: 'exact' })
    .eq('is_active', true);

  if (searchParams.category) {
    query = query.eq('categories.slug', searchParams.category);
  }
  if (searchParams.brand) {
    query = query.eq('brand', searchParams.brand);
  }
  if (searchParams.search) {
    query = query.or(
      `name_en.ilike.%${searchParams.search}%,name_np.ilike.%${searchParams.search}%`
    );
  }
  if (minPrice > 0) query = query.gte('price', minPrice);
  if (maxPrice > 0) query = query.lte('price', maxPrice);

  const { data: products, count } = await query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1);

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE);

  return (
    <div>
      {/* Result count */}
      <p className="mb-4 text-sm text-slate-500">
        {count ?? 0} product{count !== 1 ? 's' : ''} found
      </p>

      <ProductGrid products={products || []} />

      {totalPages > 1 && (
        <ProductPagination
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}
