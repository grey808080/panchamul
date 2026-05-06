'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import SearchBar from '@/components/products/SearchBar';
import CategoryTabs from '@/components/products/CategoryTabs';
import FilterSidebar from '@/components/products/FilterSidebar';
import type { Tables } from '@/types/database';
type Product = Tables<'products'>;
type Category = Tables<'categories'>;

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
}: ProductsPageClientProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [search, setSearch] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const totalPages = Math.ceil(totalCount / perPage);

  const updateFilters = (params: Record<string, string | null>) => {
    const searchParams = new URLSearchParams();
    const allParams = { category, brand, search, ...params };
    
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });

    router.push(`${pathname}?${searchParams.toString()}`);
  };

  const handleCategoryChange = (slug: string | null) => {
    setCategory(slug);
    updateFilters({ category: slug });
  };

  const handleBrandChange = (b: string | null) => {
    setBrand(b);
    updateFilters({ brand: b });
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    updateFilters({ search: q || null });
  };

  const handleReset = () => {
    setCategory(null);
    setBrand(null);
    setSearch('');
    setPriceRange([0, 100000]);
    router.push(pathname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{t('title')}</h1>
          <p className="mt-2 text-primary-100 text-blue-200/80">{t('subtitle')}</p>
          <div className="mt-6 max-w-xl">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Category Tabs */}
        <div className="mb-6">
          <CategoryTabs
            categories={categories}
            selectedSlug={category}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Content */}
        <div className="flex gap-8">
          <FilterSidebar
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            brands={brands}
            selectedBrand={brand}
            onBrandChange={handleBrandChange}
            priceRange={priceRange}
            maxPrice={100000}
            onPriceChange={setPriceRange}
            onReset={handleReset}
          />

          <div className="flex-1">
            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {t('showingResults', { count: totalCount })}
              </p>
            </div>

            <ProductGrid products={products} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => updateFilters({ page: page.toString() })}
                    className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                      page === currentPage
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
