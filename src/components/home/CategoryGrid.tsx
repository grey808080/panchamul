'use client';

import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Tables } from '@/types';

type Category = Tables<'categories'>;

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const locale = useLocale();
  const t = useTranslations('home');

  if (categories.length === 0) return null;

  return (
    <section className="py-5 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">Shop By</p>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">{t('categoriesTitle')}</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            All Categories <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll — Desktop: grid */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:overflow-visible sm:pb-0 sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const label = locale === 'np' ? cat.name_np : cat.name_en;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex-shrink-0 flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 transition-all duration-200 hover:border-primary hover:shadow-md hover:bg-orange-50/30 w-[90px] sm:w-auto"
              >
                {/* Icon circle */}
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-2xl transition-all duration-200 group-hover:bg-primary/10 group-hover:border-primary/30">
                  {cat.icon ?? '⚡'}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] sm:text-xs font-semibold text-center text-slate-600 leading-tight group-hover:text-primary transition-colors line-clamp-2 ${
                    locale === 'np' ? 'font-nepali' : 'font-heading'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* "All" tile */}
          <Link
            href="/products"
            className="group flex-shrink-0 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white p-3 sm:p-4 transition-all duration-200 hover:border-primary hover:bg-orange-50/30 w-[90px] sm:w-auto"
          >
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-lg transition-all duration-200 group-hover:bg-primary/10 group-hover:border-primary/30">
              →
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-center text-slate-500 leading-tight group-hover:text-primary">
              View All
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
