'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CategoryTabs from '@/components/products/CategoryTabs';
import FilterSidebar from '@/components/products/FilterSidebar';
import type { Tables } from '@/types/database';
type Category = Tables<'categories'>;

interface ProductsPageClientProps {
  categories: Category[];
  brands: string[];
  initialCategory: string | null;
  initialBrand: string | null;
  initialSearch: string;
  // The Suspense-wrapped ProductResults streams in as children
  children: ReactNode;
}

export default function ProductsPageClient({
  categories,
  brands,
  initialCategory,
  initialBrand,
  initialSearch,
  children,
}: ProductsPageClientProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [search, setSearch] = useState(initialSearch);
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Builds the URL and navigates. Filter changes use replace (no history
  // pollution), pagination uses push (back button works between pages).
  const buildAndNavigate = useCallback(
    (overrides: Record<string, string | null | number>) => {
      const current = { category, brand, search };
      const merged = { ...current, ...overrides };
      const sp = new URLSearchParams();
      if (merged.category) sp.set('category', merged.category as string);
      if (merged.brand) sp.set('brand', merged.brand as string);
      if (merged.search) sp.set('search', merged.search as string);
      const qs = sp.toString();
      const isPagination = 'page' in overrides && Object.keys(overrides).length === 1;
      if (isPagination) {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      } else {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      }
    },
    [category, brand, search, router, pathname]
  );

  const handleCategoryChange = (slug: string | null) => {
    setCategory(slug);
    buildAndNavigate({ category: slug, page: null });
  };

  const handleBrandChange = (b: string | null) => {
    setBrand(b);
    buildAndNavigate({ brand: b, page: null });
  };

  const handleSearchInput = (val: string) => {
    setLocalSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      buildAndNavigate({ search: val || null, page: null });
    }, 600);
  };

  const handleSearchCommit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch(localSearch);
    buildAndNavigate({ search: localSearch || null, page: null });
  };

  const handleReset = () => {
    setCategory(null);
    setBrand(null);
    setSearch('');
    setLocalSearch('');
    router.push(pathname);
  };

  const activeFilterCount = [category, brand, search].filter(Boolean).length;

  const categoryLabel = category
    ? categories.find((c) => c.slug === category)?.name_en ?? category
    : null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Dark header — renders immediately, no data dependency ── */}
      <div className="relative overflow-hidden bg-surface-bg">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">
              Catalogue
            </p>
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-slate-400 text-sm">{t('subtitle')}</p>

            {/* Search — interactive immediately */}
            <div className="mt-5 max-w-xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={localSearch}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onBlur={handleSearchCommit}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-lg border border-surface-border bg-surface-elevated py-2.5 pl-10 pr-4 text-sm text-ink-primary placeholder-ink-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">

        {/* Category tabs — interactive immediately */}
        <div className="mb-5">
          <CategoryTabs
            categories={categories}
            selectedSlug={category}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Active:
            </span>
            {categoryLabel && (
              <Chip label={categoryLabel} onRemove={() => handleCategoryChange(null)} />
            )}
            {brand && (
              <Chip label={brand} onRemove={() => handleBrandChange(null)} />
            )}
            {search && (
              <Chip
                label={`"${search}"`}
                onRemove={() => {
                  setSearch('');
                  setLocalSearch('');
                  buildAndNavigate({ search: null, page: null });
                }}
              />
            )}
            <button
              onClick={handleReset}
              className="ml-1 text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Main layout: sidebar + product area */}
        <div className="flex gap-8">

          {/* Desktop sidebar — interactive immediately */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              categories={categories}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              brands={brands}
              selectedBrand={brand}
              onBrandChange={handleBrandChange}
              onReset={handleReset}
            />
          </div>

          {/* Product results area — streams in via Suspense */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button */}
            <div className="mb-4 flex items-center justify-end lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                {t('filters')}
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ← ProductResults streams in here */}
            {children}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                <FunnelIcon className="h-4 w-4" />
                {t('filters')}
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded p-1.5 hover:bg-slate-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              selectedCategory={category}
              onCategoryChange={(slug) => {
                handleCategoryChange(slug);
                setMobileFiltersOpen(false);
              }}
              brands={brands}
              selectedBrand={brand}
              onBrandChange={(b) => {
                handleBrandChange(b);
                setMobileFiltersOpen(false);
              }}
              onReset={() => {
                handleReset();
                setMobileFiltersOpen(false);
              }}
              inlineMode
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded hover:bg-primary/20 p-0.5 transition-colors"
      >
        <XMarkIcon className="h-3 w-3" />
      </button>
    </span>
  );
}
