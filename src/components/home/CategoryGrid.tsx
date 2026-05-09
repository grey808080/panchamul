'use client';

import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Tables } from '@/types';

type Category = Tables<'categories'>;

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const locale = useLocale();
  const t = useTranslations('home');

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">Categories</p>
            <h2 className="font-heading text-3xl font-bold text-slate-900">{t('categoriesTitle')}</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-primary transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {categories.map((cat) => {
            const label = locale === 'np' ? cat.name_np : cat.name_en;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-primary hover:shadow-md"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded border border-slate-200 bg-slate-50 text-2xl transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/5">
                  {cat.icon ?? '⚡'}
                </div>

                {/* Label */}
                <span className={`text-sm font-semibold text-center text-slate-600 transition-colors group-hover:text-slate-900 leading-tight ${locale === 'np' ? 'font-nepali' : 'font-heading'}`}>
                  {label}
                </span>

                {/* Orange bottom indicator */}
                <div className="h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
