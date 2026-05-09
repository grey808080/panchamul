'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCartIcon, MinusIcon, PlusIcon, CheckIcon, XMarkIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productDetailUrl, productThumbStripUrl } from '@/lib/utils/imageUrl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;

// Inline WhatsApp SVG — no extra dependency
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface ProductDetailClientProps {
  product: Product & { categories?: { name_en: string; name_np?: string; slug: string } };
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useLockBodyScroll(lightboxOpen);

  const name = locale === 'np' && product.name_np ? product.name_np : product.name_en;
  const description = locale === 'np' && product.description_np ? product.description_np : product.description_en;
  const images = product.images?.length ? product.images : ['/placeholder-product.png'];
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const stock = product.stock_qty ?? 0;
  const stockStatus = stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'in';
  const decrementDisabled = quantity <= 1;
  const incrementDisabled = quantity >= stock;

  const handleAddToCart = () => {
    if (stock <= 0 || cartAdded) return;
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_np: product.name_np,
      slug: product.slug,
      price: product.price,
      image: images[0],
      quantity,
      stock_qty: stock,
    });
    setCartAdded(true);
    toast.success(`${quantity > 1 ? `${quantity}× ` : ''}${product.name_en} added to cart`, { duration: 2500 });
    setTimeout(() => setCartAdded(false), 2000);
  };

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '977XXXXXXXXXX';
  const waMessage = encodeURIComponent(`Hi, I'm interested in: ${product.name_en} (${formatPrice(product.price)})`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb — real links */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
          <Link href="/products" className="hover:text-primary transition-colors">
            {t('title')}
          </Link>
          {product.categories && (
            <>
              <span className="text-slate-300">/</span>
              <Link
                href={`/products?category=${product.categories.slug}`}
                className="hover:text-primary transition-colors"
              >
                {locale === 'np' && product.categories.name_np
                  ? product.categories.name_np
                  : product.categories.name_en}
              </Link>
            </>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={productDetailUrl(images[selectedImage])}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                  -{discountPercent}% OFF
                </div>
              )}
              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <MagnifyingGlassPlusIcon className="h-3.5 w-3.5" />
                Zoom
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ring-2 transition-all ${
                      i === selectedImage
                        ? 'ring-primary ring-offset-2'
                        : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <Image src={productThumbStripUrl(img)} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
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
                  ? `${t('lowStock')} (${stock} left)`
                  : t('outOfStock')}
              </Badge>
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
                  disabled={decrementDisabled}
                  className="flex h-12 w-12 items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="flex h-12 w-14 items-center justify-center text-sm font-semibold border-x border-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={incrementDisabled || stock <= 0}
                  className="flex h-12 w-12 items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={stock <= 0 || cartAdded}
                size="lg"
                className={`flex-1 transition-all duration-300 ${cartAdded ? 'bg-green-500 hover:bg-green-500 shadow-green-200' : ''}`}
              >
                {cartAdded ? (
                  <>
                    <CheckIcon className="mr-2 h-5 w-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="mr-2 h-5 w-5" />
                    {t('addToCart')}
                  </>
                )}
              </Button>
            </div>

            {/* WhatsApp Enquiry — proper WA icon */}
            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-6 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200 transition-all hover:bg-green-100 hover:ring-green-300"
            >
              <WhatsAppIcon className="h-4 w-4" />
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + images.length) % images.length); }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="absolute right-16 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % images.length); }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative max-h-[90vh] max-w-4xl w-full aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={productDetailUrl(images[selectedImage])}
              alt={name}
              fill
              className="object-contain"
              quality={90}
              sizes="90vw"
            />
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                  className={`h-2 rounded-full transition-all ${i === selectedImage ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}