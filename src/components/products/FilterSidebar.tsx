'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import type { Tables } from '@/types/database';
type Category = Tables<'categories'>;

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  brands: string[];
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
  onReset: () => void;
  /** When true, renders filter content without the sticky wrapper (used inside the mobile bottom sheet) */
  inlineMode?: boolean;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  brands,
  selectedBrand,
  onBrandChange,
  onReset,
  inlineMode = false,
}: FilterSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('products');

  const hasFilters = selectedCategory || selectedBrand;

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <FunnelIcon className="h-4 w-4" />
          {t('filters')}
        </h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('category')}
        </h4>
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="filter-category"
              checked={selectedCategory === null}
              onChange={() => onCategoryChange(null)}
              className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
            />
            <span className="text-sm text-slate-700">{t('allCategories')}</span>
          </label>
          {categories.map((cat) => {
            const label = locale === 'np' && cat.name_np ? cat.name_np : cat.name_en;
            return (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="filter-category"
                  checked={selectedCategory === cat.slug}
                  onChange={() => onCategoryChange(cat.slug)}
                  className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('brand')}
          </h4>
          <div className="space-y-1">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="filter-brand"
                checked={selectedBrand === null}
                onChange={() => onBrandChange(null)}
                className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
              />
              <span className="text-sm text-slate-700">{t('allBrands')}</span>
            </label>
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="filter-brand"
                  checked={selectedBrand === brand}
                  onChange={() => onBrandChange(brand)}
                  className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
                />
                <span className="text-sm text-slate-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (inlineMode) {
    return filterContent;
  }

  return (
    <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5">
      {filterContent}
    </div>
  );
}
