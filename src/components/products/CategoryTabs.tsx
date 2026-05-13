'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Tables } from '@/types/database';
type Category = Tables<'categories'>;

interface CategoryTabsProps {
  categories: Category[];
  selectedSlug: string | null;
  onChange: (slug: string | null) => void;
}

export default function CategoryTabs({ categories, selectedSlug, onChange }: CategoryTabsProps) {
  const locale = useLocale();
  const t = useTranslations('products');

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
          selectedSlug === null
            ? 'bg-slate-900 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
        }`}
      >
        {t('allCategories')}
      </button>
      {categories.map((cat) => {
        const label = locale === 'np' && cat.name_np ? cat.name_np : cat.name_en;
        const isActive = selectedSlug === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.slug)}
            className={`shrink-0 rounded px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? 'bg-primary text-white shadow-orange'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
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
