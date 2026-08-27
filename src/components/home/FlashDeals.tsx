'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCartIcon, CheckIcon, FireIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productThumbUrl } from '@/lib/utils/imageUrl';
import toast from 'react-hot-toast';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  return Math.max(0, midnight.getTime() - now.getTime());
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function CountdownTimer() {
  // null = not yet mounted → server renders nothing, avoiding SSR/hydration mismatch
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    setMs(getTimeUntilMidnight());
    const t = setInterval(() => setMs(getTimeUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  if (ms === null) return null;

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);

  const Unit = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="font-heading font-bold text-white text-base sm:text-lg leading-none bg-surface-bg border border-surface-border rounded px-2 py-1 min-w-[36px] text-center tabular-nums">
        {pad(val)}
      </span>
      <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex items-end gap-1">
      <Unit val={h} label="hrs" />
      <span className="text-primary font-bold pb-4">:</span>
      <Unit val={m} label="min" />
      <span className="text-primary font-bold pb-4">:</span>
      <Unit val={s} label="sec" />
    </div>
  );
}

function DealCard({ product }: { product: Product }) {
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;
  const stock = product.stock_qty ?? 0;
  const stockPct = Math.min(100, Math.max(0, stock > 0 ? Math.round(((50 - Math.min(stock, 50)) / 50) * 100) : 100));

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
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={productThumbUrl(product.images?.[0])}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="180px"
          quality={70}
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">
            -{discountPct}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.brand}</p>
        <h3 className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-slate-900">
          {name}
        </h3>

        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm font-bold text-slate-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.compare_price!)}</span>
            )}
          </div>

          {/* Stock bar */}
          <div className="mt-1.5 mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-slate-400">Sold: {stockPct}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stockPct}%`,
                  backgroundColor: stockPct > 70 ? '#EF4444' : stockPct > 40 ? '#F59E0B' : '#10B981',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={stock <= 0}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
              added
                ? 'bg-emerald-500 text-white'
                : stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-light active:scale-[0.97]'
            }`}
          >
            {added ? <CheckIcon className="h-3 w-3" /> : <ShoppingCartIcon className="h-3 w-3" />}
            {added ? 'Added' : stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

interface FlashDealsProps {
  products: Product[];
}

export default function FlashDeals({ products }: FlashDealsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-6 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-red-500 animate-pulse" />
              <h2 className="font-heading font-bold text-slate-900 text-xl sm:text-2xl">Flash Deals</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500">Ends in</span>
              <CountdownTimer />
            </div>
          </div>
          <Link
            href="/products"
            className="text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary-light transition-colors"
          >
            View All →
          </Link>
        </div>

        {/* Mobile countdown */}
        <div className="flex items-center gap-2 sm:hidden mb-4">
          <span className="text-xs text-slate-500">Ends in</span>
          <CountdownTimer />
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
          {products.map((p) => (
            <DealCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
