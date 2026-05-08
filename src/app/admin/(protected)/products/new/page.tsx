import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const supabase = createAdminClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Add New Product</h1>
      <ProductForm categories={categories || []} />
    </div>
  );
}
