'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ClockIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/formatPrice';
import { productThumbUrl } from '@/lib/utils/imageUrl';

const STORAGE_KEY = 'panchamul_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name_en: string;
  name_np?: string | null;
  price: number;
  compare_price?: number | null;
  images?: string[] | null;
  brand?: string | null;
  category_id?: string | null; // used by RecommendedForYou
}

export function saveRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === 'undefined') return;
  try {
    const existing: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = existing.filter((p) => p.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored: RecentlyViewedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored.slice(0, 8));
    } catch {
      setItems([]);
    }
  }, []);

  if (!mounted || items.length < 2) return null; // only show when there's actual history

  return (
    <section className="py-8 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 mb-5">
          <ClockIcon className="h-4 w-4 text-slate-400" />
          <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-700">Recently Viewed</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
          {items.map((item) => {
            const hasDiscount = item.compare_price && item.compare_price > item.price;
            const discountPct = hasDiscount
              ? Math.round(((item.compare_price! - item.price) / item.compare_price!) * 100)
              : 0;

            return (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group flex-shrink-0 w-[130px] sm:w-[150px] flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  <Image
                    src={productThumbUrl(item.images?.[0])}
                    alt={item.name_en}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="150px"
                    quality={65}
                  />
                  {hasDiscount && (
                    <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                      -{discountPct}%
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.name_en}
                  </p>
                  <p className="font-heading text-sm font-bold text-slate-900 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
