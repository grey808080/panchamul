'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types/database';

interface ProductFormProps {
  categories: Category[];
  initialData?: Product;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name_en: initialData?.name_en || '',
      name_np: initialData?.name_np || '',
      slug: initialData?.slug || '',
      category_id: initialData?.category_id || '',
      brand: initialData?.brand || '',
      price: initialData?.price || 0,
      compare_price: initialData?.compare_price || 0,
      stock_qty: initialData?.stock_qty || 0,
      unit: initialData?.unit || 'pcs',
      description_en: initialData?.description_en || '',
      description_np: initialData?.description_np || '',
      featured: initialData?.featured || false,
      active: initialData?.active ?? true,
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    
    const payload = {
      ...data,
      images,
      price: Number(data.price),
      compare_price: Number(data.compare_price) || null,
      stock_qty: Number(data.stock_qty),
    };

    if (initialData) {
      // Update
      const { error } = await supabase.from('products').update(payload).eq('id', initialData.id);
      if (error) alert('Error updating product: ' + error.message);
      else router.push('/admin/products');
    } else {
      // Insert
      const { error } = await supabase.from('products').insert(payload);
      if (error) alert('Error creating product: ' + error.message);
      else router.push('/admin/products');
    }
    
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (English)</label>
                <input {...register('name_en', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name (Nepali)</label>
                <input {...register('name_np')} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input {...register('slug', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select {...register('category_id', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-2">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <input {...register('brand')} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                <textarea {...register('description_en')} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Nepali)</label>
                <textarea {...register('description_np')} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Images</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pricing & Inventory</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (NPR)</label>
                <input type="number" {...register('price', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compare at Price (Optional)</label>
                <input type="number" {...register('compare_price')} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                <input type="number" {...register('stock_qty', { required: true })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit (e.g. pcs, meter, box)</label>
                <input {...register('unit')} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Status & Visibility</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" {...register('active')} className="h-5 w-5 rounded text-primary focus:ring-primary/30" />
                <span className="font-medium text-slate-700">Active (Visible on site)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" {...register('featured')} className="h-5 w-5 rounded text-primary focus:ring-primary/30" />
                <span className="font-medium text-slate-700">Featured Product</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</Button>
      </div>
    </form>
  );
}
