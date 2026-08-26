import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: categories }, { data: product, error }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('products').select('*').eq('id', id).single(),
  ]);

  if (error || !product) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/products"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-xs text-slate-400 mt-0.5">{product.name_en}</p>
        </div>
      </div>

      <ProductForm categories={categories || []} initialData={product} />
    </div>
  );
}
