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
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (range: [number, number]) => void;
  /** Called when the user finishes dragging the price slider (mouseup/touchend) */
  onPriceCommit?: (range: [number, number]) => void;
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
  priceRange,
  maxPrice,
  onPriceChange,
  onPriceCommit,
  onReset,
  inlineMode = false,
}: FilterSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('products');

  const hasFilters =
    selectedCategory ||
    selectedBrand ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

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

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('priceRange')}
        </h4>
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>रु {priceRange[0].toLocaleString()}</span>
            <span>रु {priceRange[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={500}
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            onMouseUp={(e) => onPriceCommit?.([priceRange[0], Number((e.target as HTMLInputElement).value)])}
            onTouchEnd={(e) => onPriceCommit?.([priceRange[0], Number((e.target as HTMLInputElement).value)])}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>रु 0</span>
            <span>रु {maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // inlineMode: no wrapper (used inside mobile bottom sheet or parent manages layout)
  if (inlineMode) {
    return filterContent;
  }

  // Desktop: sticky sidebar card
  return (
    <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5">
      {filterContent}
    </div>
  );
}