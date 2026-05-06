'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Category } from '@/types/database';

interface CategoryTabsProps {
  categories: Category[];
  selectedSlug: string | null;
  onChange: (slug: string | null) => void;
}

export default function CategoryTabs({ categories, selectedSlug, onChange }: CategoryTabsProps) {
  const locale = useLocale();
  const t = useTranslations('products');

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
          selectedSlug === null
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {t('allCategories')}
      </button>
      {categories.map((cat) => {
        const label = locale === 'np' && cat.name_np ? cat.name_np : cat.name;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.slug)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              selectedSlug === cat.slug
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
            {label}
          </button>
        );
      })}
    </div>
  );
}
