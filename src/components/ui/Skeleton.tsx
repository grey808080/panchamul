import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200', className)}
    />
  );
}

/** 2×4 grid of product card skeletons */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Single product detail skeleton */
export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-20 rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Products page full skeleton (header + grid) */
export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-10 px-4">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-9 w-48 bg-white/20" />
          <Skeleton className="h-4 w-64 bg-white/10" />
          <Skeleton className="h-12 max-w-xl rounded-xl bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Category tabs */}
        <div className="mb-5 flex gap-2 overflow-hidden">
          {[80, 120, 100, 90, 110, 80].map((w, i) => (
            <Skeleton key={i} className="h-9 rounded-full flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-4">
            <Skeleton className="h-6 w-24" />
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            <Skeleton className="h-6 w-24 mt-4" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
          </div>
          <div className="flex-1">
            <Skeleton className="mb-4 h-4 w-32" />
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Admin table row skeletons */
export function AdminTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Admin dashboard stat card skeletons */
export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
