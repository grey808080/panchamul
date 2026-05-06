'use client';

import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
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
  onReset: () => void;
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
  onReset,
}: FilterSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('products');
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasFilters = selectedCategory || selectedBrand || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FunnelIcon className="h-5 w-5" />
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
        <h4 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wider">
          {t('category')}
        </h4>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === null}
              onChange={() => onCategoryChange(null)}
              className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
            />
            <span className="text-sm text-slate-700">{t('allCategories')}</span>
          </label>
          {categories.map((cat) => {
            const label = locale === 'np' && cat.name_np ? cat.name_np : cat.name;
            return (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="category"
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
          <h4 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {t('brand')}
          </h4>
          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === null}
                onChange={() => onBrandChange(null)}
                className="h-4 w-4 text-primary focus:ring-primary/30 border-slate-300"
              />
              <span className="text-sm text-slate-700">{t('allBrands')}</span>
            </label>
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="brand"
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
        <h4 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wider">
          {t('priceRange')}
        </h4>
        <div className="space-y-3 px-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>रु {priceRange[0].toLocaleString()}</span>
            <span>रु {priceRange[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 lg:hidden"
      >
        <FunnelIcon className="h-4 w-4" />
        {t('filters')}
        {hasFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            !
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-end mb-2">
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          {filterContent}
        </div>
      </div>
    </>
  );
}
