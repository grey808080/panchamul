'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import { createPublicClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface ProductFormProps {
  categories: Category[];
  initialData?: Product;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const supabase = createPublicClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name_en: initialData?.name_en || '',
      name_np: initialData?.name_np || '',
      slug: initialData?.slug || '',
      category_id: initialData?.category_id || '',
      brand: initialData?.brand || '',
      price: initialData?.price || 0,
      compare_price: initialData?.compare_price || '',
      stock_qty: initialData?.stock_qty || 0,
      description_en: initialData?.description_en || '',
      description_np: initialData?.description_np || '',
      is_featured: initialData?.is_featured || false,
      is_active: initialData?.is_active ?? true,
    },
  });

  // Auto-generate slug from English name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!initialData) setValue('slug', slug);
  };

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
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', initialData.id);
      if (error) alert('Error updating product: ' + error.message);
      else router.push('/admin/products');
    } else {
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
                <label className="label">Name (English) *</label>
                <input
                  {...register('name_en', { required: true })}
                  onChange={(e) => { register('name_en').onChange(e); handleNameChange(e); }}
                  className="input-field"
                  placeholder="e.g. Havells 2.5mm Wire"
                />
                {errors.name_en && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div>
                <label className="label">Name (Nepali)</label>
                <input
                  {...register('name_np')}
                  className="input-field"
                  placeholder="e.g. हेभेल्स तार"
                />
              </div>
              <div>
                <label className="label">Slug (URL) *</label>
                <input
                  {...register('slug', { required: true })}
                  className="input-field"
                  placeholder="auto-generated"
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div>
                <label className="label">Category *</label>
                <select
                  {...register('category_id', { required: true })}
                  className="input-field"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_en}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div>
                <label className="label">Brand</label>
                <input
                  {...register('brand')}
                  className="input-field"
                  placeholder="e.g. Havells, Anchor, Philips"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Description (English)</label>
                <textarea
                  {...register('description_en')}
                  rows={4}
                  className="input-field"
                  placeholder="Product description..."
                />
              </div>
              <div>
                <label className="label">Description (Nepali)</label>
                <textarea
                  {...register('description_np')}
                  rows={4}
                  className="input-field"
                  placeholder="सामग्रीको विवरण..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Images</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pricing & Stock</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Price (NPR) *</label>
                <input
                  type="number"
                  {...register('price', { required: true, min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Compare Price (Optional)</label>
                <input
                  type="number"
                  {...register('compare_price')}
                  className="input-field"
                  placeholder="Original price before discount"
                />
              </div>
              <div>
                <label className="label">Stock Quantity *</label>
                <input
                  type="number"
                  {...register('stock_qty', { required: true, min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Visibility</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="h-5 w-5 rounded text-primary focus:ring-primary/30"
                />
                <div>
                  <p className="font-medium text-slate-700">Active</p>
                  <p className="text-xs text-slate-400">Visible to customers</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="h-5 w-5 rounded text-primary focus:ring-primary/30"
                />
                <div>
                  <p className="font-medium text-slate-700">Featured</p>
                  <p className="text-xs text-slate-400">Show on homepage</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}