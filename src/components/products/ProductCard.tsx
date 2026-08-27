'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productThumbUrl } from '@/lib/utils/imageUrl';
import toast from 'react-hot-toast';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;
  const stockQty = product.stock_qty ?? 0;
  const stockStatus = stockQty <= 0 ? 'out' : stockQty <= 5 ? 'low' : 'in';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stockQty <= 0 || added) return;

    addItem({
      id: product.id,
      name_en: product.name_en,
      name_np: product.name_np,
      slug: product.slug,
      price: product.price,
      image: productThumbUrl(product.images?.[0]),
      quantity: 1,
      stock_qty: stockQty,
    });

    setAdded(true);
    toast.success(`${product.name_en} added to cart`, { duration: 2000 });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-primary hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={productThumbUrl(product.images?.[0])}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
        />

        {/* Out of stock overlay */}
        {stockStatus === 'out' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('outOfStock')}
            </span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            -{discountPercent}%
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && !hasDiscount && (
          <div className="absolute top-2 left-2 border border-primary/50 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {t('featured')}
          </div>
        )}

        {/* Low stock */}
        {stockStatus === 'low' && (
          <div className="absolute top-2 right-2 bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {t('lowStock')}
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          disabled={stockQty <= 0}
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded border transition-all duration-200 disabled:cursor-not-allowed ${
            added
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-primary bg-primary text-white hover:bg-primary-light disabled:opacity-40'
          }`}
          aria-label={t('addToCart')}
        >
          {added
            ? <CheckIcon className="h-4 w-4" />
            : <ShoppingCartIcon className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{product.brand}</p>
        )}

        <h3 className={`text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 group-hover:text-slate-900 transition-colors leading-snug ${locale === 'np' && product.name_np ? 'font-nepali' : ''}`}>
          {name}
        </h3>

        <div className="mt-auto pt-2 flex items-end justify-between gap-1">
          <div>
            <span className="font-heading text-base sm:text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="block text-[10px] text-slate-400 line-through">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orange bottom border on hover */}
      <div className="h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
