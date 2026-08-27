'use client';

import { Link } from '@/i18n/navigation';
import { FireIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/products/ProductCard';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface TrendingNowProps {
  products: Product[];
}

export default function TrendingNow({ products }: TrendingNowProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FireIcon className="h-4 w-4 text-orange-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500">Popular</p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">Trending Now</h2>
            <p className="text-xs text-slate-500 mt-1">What customers are buying most</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors border border-slate-200 rounded-lg px-3 py-2 hover:border-primary"
          >
            View All →
          </Link>
        </div>

        {/* Grid — 5 columns on desktop so more products are visible */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-5 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-primary rounded-lg px-4 py-2"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
