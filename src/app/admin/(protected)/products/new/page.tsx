import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function NewProductPage() {
  const supabase = createAdminClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

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
          <h1 className="text-xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-xs text-slate-400 mt-0.5">Fill in the details below to list a new product</p>
        </div>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  );
}
