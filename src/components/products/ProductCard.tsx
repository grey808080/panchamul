'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Badge } from '@/components/ui/Badge';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const stockStatus = product.stock_qty <= 0
    ? 'out'
    : product.stock_qty <= 5
    ? 'low'
    : 'in';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_qty <= 0) return;
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_np: product.name_np,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || '/placeholder-product.png',
      quantity: 1,
      stock_qty: product.stock_qty,
    });
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={product.images?.[0] || '/placeholder-product.png'}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-bold text-slate-900 shadow-lg">
            ⭐ {t('featured')}
          </div>
        )}

        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock_qty <= 0}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          aria-label={t('addToCart')}
        >
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {product.brand && (
          <p className="text-xs text-slate-400">{product.brand}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>

          <Badge
            variant={stockStatus === 'in' ? 'success' : stockStatus === 'low' ? 'warning' : 'danger'}
          >
            {stockStatus === 'in'
              ? t('inStock')
              : stockStatus === 'low'
              ? t('lowStock')
              : t('outOfStock')}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
