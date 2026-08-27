'use client';

import { Link } from '@/i18n/navigation';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/products/ProductCard';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-4 w-4 text-primary" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Just In</p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">New Arrivals</h2>
            <p className="text-xs text-slate-500 mt-1">Fresh stock from top brands</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors border border-slate-200 rounded-lg px-3 py-2 hover:border-primary"
          >
            View All Products →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
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
