'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import type { Tables, Enums } from '@/types/database';
type Product = Tables<'products'>;

interface FeaturedProductsClientProps {
  products: Product[];
}

export default function FeaturedProductsClient({ products }: FeaturedProductsClientProps) {
  const t = useTranslations('home');

  if (products.length === 0) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900">{t('featuredTitle')}</h2>
          <p className="mt-4 text-slate-500">{t('featuredEmpty')}</p>
          <Link href="/products">
            <Button className="mt-6">{t('viewAll')}</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{t('featuredTitle')}</h2>
            <p className="mt-1 text-slate-500">{t('featuredSubtitle')}</p>
          </div>
          <Link href="/products" className="hidden sm:block">
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products">
            <Button variant="outline">{t('viewAll')}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
