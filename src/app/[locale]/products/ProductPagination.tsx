'use client';

import { useRouter, usePathname } from '@/i18n/navigation';

const MAX_PRICE = 100000;

interface SearchParams {
  category?: string;
  brand?: string;
  search?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}

function getPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  const around = new Set(
    [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  let prev: number | null = null;
  for (const p of [...around].sort((a, b) => a - b)) {
    if (prev !== null && p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }
  return pages;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  searchParams,
}: ProductPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const goToPage = (page: number) => {
    const sp = new URLSearchParams();
    if (searchParams.category) sp.set('category', searchParams.category);
    if (searchParams.brand) sp.set('brand', searchParams.brand);
    if (searchParams.search) sp.set('search', searchParams.search);
    if (Number(searchParams.minPrice) > 0) sp.set('minPrice', searchParams.minPrice!);
    if (Number(searchParams.maxPrice) > 0 && Number(searchParams.maxPrice) < MAX_PRICE)
      sp.set('maxPrice', searchParams.maxPrice!);
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      {getPages(currentPage, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p as number)}
            className={`h-9 w-9 rounded text-sm font-medium transition-all ${
              p === currentPage
                ? 'bg-primary text-white shadow-orange'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {p}
          </button>
        )
      )}
    </div>
  );
}
