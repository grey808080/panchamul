'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import ImageUploader from './ImageUploader';
import { createPublicClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
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
      slug: initialData?.slug || '',
      category_id: initialData?.category_id || '',
      brand: initialData?.brand || '',
      price: initialData?.price || 0,
      compare_price: initialData?.compare_price || '',
      stock_qty: initialData?.stock_qty || 0,
      description_en: initialData?.description_en || '',
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
      if (error) {
        toast.error('Error updating product: ' + error.message);
      } else {
        toast.success('Product updated!');
        router.push('/admin/products');
      }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        toast.error('Error creating product: ' + error.message);
      } else {
        toast.success('Product created!');
        router.push('/admin/products');
      }
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
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name *</label>
                <input
                  {...register('name_en', { required: true })}
                  onChange={(e) => { register('name_en').onChange(e); handleNameChange(e); }}
                  className="input-field"
                  placeholder="e.g. Havells 2.5mm Wire"
                />
                {errors.name_en && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>

              <div>
                <label className="label">
                  Slug (URL) *
                  {!initialData && <span className="ml-1.5 text-[10px] font-normal text-slate-400 normal-case tracking-normal">auto-generated from name</span>}
                </label>
                <input
                  {...register('slug', { required: true })}
                  className="input-field font-mono text-sm"
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

            <div className="mt-5">
              <label className="label">Description</label>
              <textarea
                {...register('description_en')}
                rows={4}
                className="input-field"
                placeholder="Product description..."
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5">Images</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5">Pricing &amp; Stock</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Price (NPR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">Rs.</span>
                  <input
                    type="number"
                    {...register('price', { required: true, min: 0 })}
                    className="input-field pl-10"
                    placeholder="0"
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div>
                <label className="label">
                  Compare Price
                  <span className="ml-1.5 text-[10px] font-normal text-slate-400 normal-case tracking-normal">before discount</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">Rs.</span>
                  <input
                    type="number"
                    {...register('compare_price')}
                    className="input-field pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="label">Stock Quantity *</label>
                <input
                  type="number"
                  {...register('stock_qty', { required: true, min: 0 })}
                  className="input-field"
                  placeholder="0"
                />
                {errors.stock_qty && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Visibility</h3>
            <div className="divide-y divide-slate-100">
              <label className="flex items-center justify-between gap-3 cursor-pointer py-3 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors">
                <div>
                  <p className="font-medium text-slate-700 text-sm">Active</p>
                  <p className="text-xs text-slate-400">Visible to customers</p>
                </div>
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30 shrink-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer py-3 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors">
                <div>
                  <p className="font-medium text-slate-700 text-sm">Featured</p>
                  <p className="text-xs text-slate-400">Show on homepage</p>
                </div>
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30 shrink-0"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center gap-4">
        <p className="text-xs text-slate-400 hidden sm:block flex-1">
          {initialData ? 'Changes will be saved immediately.' : 'Product will be listed after saving.'}
        </p>
        <div className="flex items-center gap-3 ml-auto">
          <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : initialData ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </form>
  );
}