import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

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
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Product</h1>
      <ProductForm categories={categories || []} initialData={product} />
    </div>
  );
}
