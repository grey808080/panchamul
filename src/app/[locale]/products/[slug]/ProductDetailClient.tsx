'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCartIcon, MinusIcon, PlusIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/products/ProductCard';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

interface ProductDetailClientProps {
  product: Product & { categories?: { name: string; name_np?: string; slug: string } };
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const description = locale === 'np' && product.description_np ? product.description_np : product.description_en;
  const images = product.images?.length ? product.images : ['/placeholder-product.png'];
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const stockStatus = product.stock_qty <= 0 ? 'out' : product.stock_qty <= 5 ? 'low' : 'in';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_np: product.name_np,
      slug: product.slug,
      price: product.price,
      image: images[0],
      quantity,
      stock_qty: product.stock_qty,
    });
  };

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '977XXXXXXXXXX';
  const waMessage = encodeURIComponent(`Hi, I'm interested in: ${product.name_en} (${formatPrice(product.price)})`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <span className="hover:text-primary cursor-pointer">{t('title')}</span>
          {product.categories && (
            <>
              <span className="mx-2">/</span>
              <span className="hover:text-primary cursor-pointer">
                {locale === 'np' && product.categories.name_np
                  ? product.categories.name_np
                  : product.categories.name}
              </span>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
              <Image
                src={images[selectedImage]}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl ring-2 transition-all ${
                      i === selectedImage
                        ? 'ring-primary ring-offset-2'
                        : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-sm font-medium text-primary uppercase tracking-wider">{product.brand}</p>
            )}

            <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">{name}</h1>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold text-slate-900">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-xl text-slate-400 line-through">{formatPrice(product.compare_price!)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3">
              <Badge variant={stockStatus === 'in' ? 'success' : stockStatus === 'low' ? 'warning' : 'danger'}>
                {stockStatus === 'in'
                  ? t('inStock')
                  : stockStatus === 'low'
                  ? `${t('lowStock')} (${product.stock_qty} left)`
                  : t('outOfStock')}
              </Badge>
              {product.unit && (
                <span className="text-sm text-slate-500">per {product.unit}</span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="prose prose-sm text-slate-600 border-t border-slate-100 pt-6">
                <p>{description}</p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-xl ring-1 ring-slate-200 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="flex h-12 w-14 items-center justify-center text-sm font-semibold border-x border-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="flex h-12 w-12 items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock_qty <= 0}
                size="lg"
                className="flex-1"
              >
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                {t('addToCart')}
              </Button>
            </div>

            {/* WhatsApp Enquiry */}
            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-6 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200 transition-all hover:bg-green-100 hover:ring-green-300"
            >
              <PhoneIcon className="h-4 w-4" />
              {t('enquireWhatsApp')}
            </a>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl font-bold text-slate-900">{t('relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
