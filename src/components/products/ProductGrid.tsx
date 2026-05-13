'use client';

import ProductCard from './ProductCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations('products');

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded border border-slate-200 bg-slate-50 mb-4">
          <MagnifyingGlassIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-heading text-lg font-bold text-slate-700">{t('noProducts')}</h3>
        <p className="mt-1 text-sm text-slate-500">{t('tryDifferentFilter')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
