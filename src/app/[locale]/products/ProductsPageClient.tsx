'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductGrid from '@/components/products/ProductGrid';
import CategoryTabs from '@/components/products/CategoryTabs';
import FilterSidebar from '@/components/products/FilterSidebar';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;
type Category = Tables<'categories'>;

const MAX_PRICE = 100000;

interface ProductsPageClientProps {
  products: Product[];
  categories: Category[];
  brands: string[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  initialCategory: string | null;
  initialBrand: string | null;
  initialSearch: string;
  initialMinPrice: number;
  initialMaxPrice: number;
}

// Smart pagination: show first, last, current ±1, with ellipsis
function getPaginationPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  const around = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  let prev: number | null = null;
  for (const p of [...around].sort((a, b) => a - b)) {
    if (prev !== null && p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }
  return pages;
}

export default function ProductsPageClient({
  products,
  categories,
  brands,
  totalCount,
  currentPage,
  perPage,
  initialCategory,
  initialBrand,
  initialSearch,
  initialMinPrice,
  initialMaxPrice,
}: ProductsPageClientProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [search, setSearch] = useState(initialSearch);
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMinPrice,
    initialMaxPrice || MAX_PRICE,
  ]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = Math.ceil(totalCount / perPage);

  const buildAndNavigate = useCallback(
    (overrides: Record<string, string | null | number>) => {
      const current = { category, brand, search, minPrice: priceRange[0], maxPrice: priceRange[1] };
      const merged = { ...current, ...overrides };
      const sp = new URLSearchParams();
      if (merged.category) sp.set('category', merged.category as string);
      if (merged.brand) sp.set('brand', merged.brand as string);
      if (merged.search) sp.set('search', merged.search as string);
      if ((merged.minPrice as number) > 0) sp.set('minPrice', String(merged.minPrice));
      if ((merged.maxPrice as number) < MAX_PRICE) sp.set('maxPrice', String(merged.maxPrice));
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [category, brand, search, priceRange, router, pathname]
  );

  const handleCategoryChange = (slug: string | null) => {
    setCategory(slug);
    buildAndNavigate({ category: slug, page: null });
  };

  const handleBrandChange = (b: string | null) => {
    setBrand(b);
    buildAndNavigate({ brand: b, page: null });
  };

  // Search: update local state immediately for snappy UI,
  // navigate only after 600ms idle (not on every keystroke)
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

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handlePriceCommit = (range: [number, number]) => {
    setPriceRange(range);
    buildAndNavigate({ minPrice: range[0], maxPrice: range[1], page: null });
  };

  const handleReset = () => {
    setCategory(null);
    setBrand(null);
    setSearch('');
    setLocalSearch('');
    setPriceRange([0, MAX_PRICE]);
    router.push(pathname);
  };

  const activeFilterCount = [
    category,
    brand,
    search,
    priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 'price' : null,
  ].filter(Boolean).length;

  const categoryLabel = category
    ? categories.find((c) => c.slug === category)?.name_en ?? category
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-1 text-blue-200/80 text-sm">{t('subtitle')}</p>

          {/* Search bar */}
          <div className="mt-5 max-w-xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => handleSearchInput(e.target.value)}
                onBlur={handleSearchCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCommit()}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border-0 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Category Tabs */}
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
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active:</span>
            {categoryLabel && (
              <Chip label={categoryLabel} onRemove={() => handleCategoryChange(null)} />
            )}
            {brand && (
              <Chip label={brand} onRemove={() => handleBrandChange(null)} />
            )}
            {search && (
              <Chip label={`"${search}"`} onRemove={() => { setSearch(''); setLocalSearch(''); buildAndNavigate({ search: null, page: null }); }} />
            )}
            {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
              <Chip
                label={`रु ${priceRange[0].toLocaleString()} – रु ${priceRange[1].toLocaleString()}`}
                onRemove={() => handlePriceCommit([0, MAX_PRICE])}
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

        {/* Main content: sidebar + grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              categories={categories}
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              brands={brands}
              selectedBrand={brand}
              onBrandChange={handleBrandChange}
              priceRange={priceRange}
              maxPrice={MAX_PRICE}
              onPriceChange={handlePriceChange}
              onPriceCommit={handlePriceCommit}
              onReset={handleReset}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {t('showingResults', { count: totalCount })}
              </p>

              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 lg:hidden"
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

            <ProductGrid products={products} />

            {/* Smart pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                {getPaginationPages(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => buildAndNavigate({ page: p })}
                      className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                        p === currentPage
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                {t('filters')}
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              selectedCategory={category}
              onCategoryChange={(slug) => { handleCategoryChange(slug); setMobileFiltersOpen(false); }}
              brands={brands}
              selectedBrand={brand}
              onBrandChange={(b) => { handleBrandChange(b); setMobileFiltersOpen(false); }}
              priceRange={priceRange}
              maxPrice={MAX_PRICE}
              onPriceChange={handlePriceChange}
              onPriceCommit={handlePriceCommit}
              onReset={() => { handleReset(); setMobileFiltersOpen(false); }}
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
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors">
        <XMarkIcon className="h-3 w-3" />
      </button>
    </span>
  );
}                                                                                   