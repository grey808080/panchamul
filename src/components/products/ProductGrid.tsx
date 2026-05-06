'use client';

import ProductCard from './ProductCard';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;
import { useTranslations } from 'next-intl';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
      <div className="aspect-square bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="flex justify-between items-end">
          <div className="h-6 w-20 rounded bg-slate-200" />
          <div className="h-5 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  const t = useTranslations('products');

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-slate-100 p-6 mb-4">
          <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700">{t('noProducts')}</h3>
        <p className="mt-1 text-sm text-slate-500">{t('tryDifferentFilter')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
