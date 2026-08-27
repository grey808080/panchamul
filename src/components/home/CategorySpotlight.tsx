'use client';

import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productThumbUrl } from '@/lib/utils/imageUrl';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Tables } from '@/types/database';

type Product = Tables<'products'>;

interface Category {
  id: string;
  name_en: string;
  name_np: string;
  slug: string;
  icon: string | null;
}

interface CategorySpotlightProps {
  category: Category;
  products: Product[];
  variant?: 'orange' | 'blue';
}

const GRADIENTS = {
  orange: 'from-orange-500 to-amber-600',
  blue: 'from-slate-700 to-slate-900',
};

export default function CategorySpotlight({ category, products, variant = 'orange' }: CategorySpotlightProps) {
  const locale = useLocale();
  const gradient = GRADIENTS[variant];

  if (products.length === 0) return null;

  return (
    <section className="py-4 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl overflow-hidden border border-slate-200">
          {/* Left: Category Banner */}
          <div
            className={`relative flex flex-col justify-between p-6 bg-gradient-to-br ${gradient} text-white min-h-[200px] sm:min-h-0`}
          >
            {/* Background emoji */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[100px] opacity-10 select-none">{category.icon ?? '⚡'}</span>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
                Shop by Category
              </p>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl leading-tight">
                {locale === 'np' ? category.name_np : category.name_en}
              </h3>
              <p className="mt-1.5 text-sm text-white/75">
                Browse our full collection
              </p>
            </div>

            <Link
              href={`/products?category=${category.slug}`}
              className="relative z-10 mt-4 inline-flex items-center gap-2 self-start rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all border border-white/20"
            >
              Shop Now <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {/* Right: 2×2 Product Grid */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-px bg-slate-100">
            {products.slice(0, 4).map((product) => {
              const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
              const hasDiscount = product.compare_price && product.compare_price > product.price;
              const discountPct = hasDiscount
                ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
                : 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex gap-3 items-center bg-white p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={productThumbUrl(product.images?.[0])}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                      quality={65}
                    />
                    {hasDiscount && (
                      <div className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-sm">
                        -{discountPct}%
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold truncate">{product.brand}</p>
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {name}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-heading text-sm font-bold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(product.compare_price!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
