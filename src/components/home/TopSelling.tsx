'use client';

import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { TrophyIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productThumbUrl } from '@/lib/utils/imageUrl';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

function RankedCard({ product, rank }: { product: Product; rank: number }) {
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const stock = product.stock_qty ?? 0;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
  const rankColor = rank <= 3 ? rankColors[rank - 1] : 'text-slate-400';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0 || added) return;
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_np: product.name_np,
      slug: product.slug,
      price: product.price,
      image: productThumbUrl(product.images?.[0]),
      quantity: 1,
      stock_qty: stock,
    });
    setAdded(true);
    toast.success(`${product.name_en} added to cart`, { duration: 2000 });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex-shrink-0 w-[200px] sm:w-[220px] flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Image
          src={productThumbUrl(product.images?.[0])}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="220px"
          quality={70}
        />
        {/* Rank badge */}
        <div className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
          <span className={`font-heading font-bold text-sm leading-none ${rankColor}`}>
            {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
          </span>
        </div>
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {product.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.brand}</p>
        )}
        <h3 className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-slate-900">
          {name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <span className="font-heading text-sm sm:text-base font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="block text-[10px] text-slate-400 line-through">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={stock <= 0}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              added
                ? 'bg-emerald-500 text-white'
                : stock <= 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-light active:scale-95'
            }`}
            aria-label="Add to cart"
          >
            {added ? <CheckIcon className="h-3.5 w-3.5" /> : <ShoppingCartIcon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

interface TopSellingProps {
  products: Product[];
}

export default function TopSelling({ products }: TopSellingProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrophyIcon className="h-4 w-4 text-amber-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Best Sellers</p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">Top Selling</h2>
            <p className="text-xs text-slate-500 mt-1">Most popular products this week</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors border border-slate-200 rounded-lg px-3 py-2 hover:border-primary"
          >
            View All →
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
          {products.map((product, idx) => (
            <RankedCard key={product.id} product={product} rank={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
