import { cn } from '@/lib/utils/cn';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

/**
 * Base skeleton block.
 * - On light pages: `bg-slate-200` pulse (default)
 * - On dark pages: `bg-white/8` pulse — pass dark={true}
 * Shape: `rounded` (2px) to match the industrial design system.
 */
export function Skeleton({ className, dark = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded',
        dark ? 'bg-white/8' : 'bg-slate-200',
        className
      )}
      {...props}
    />
  );
}

// ─── Reusable dark-surface skeleton (for hero headers) ───────────────────────
function DarkSkeleton({ className }: { className?: string }) {
  return <Skeleton dark className={className} />;
}

// ─── Shared dark page header skeleton ────────────────────────────────────────
// Used by all pages that have the dark industrial header
export function PageHeaderSkeleton({ eyebrow = true }: { eyebrow?: boolean }) {
  return (
    <div className="relative bg-surface-bg px-4 py-14 sm:py-11">
      <div className="mx-auto max-w-6xl space-y-3 max-w-2xl">
        {eyebrow && <DarkSkeleton className="h-5 w-32" />}
        <DarkSkeleton className="h-10 w-72 sm:w-96" />
        <DarkSkeleton className="h-4 w-64" />
        <DarkSkeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

// ─── Product card skeleton ────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-24 mt-1" />
      </div>
    </div>
  );
}

// ─── Product grid skeleton ────────────────────────────────────────────────────
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Products page skeleton ───────────────────────────────────────────────────
export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Dark header */}
      <div className="bg-surface-bg px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-3">
          <DarkSkeleton className="h-3 w-20" />
          <DarkSkeleton className="h-9 w-56" />
          <DarkSkeleton className="h-4 w-40" />
          <DarkSkeleton className="h-10 max-w-xl rounded-lg" />
        </div>
      </div>
      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Category tabs */}
        <div className="mb-5 flex gap-2 overflow-hidden">
          {[72, 100, 88, 80, 96, 72].map((w, i) => (
            <Skeleton key={i} className="h-8 rounded flex-shrink-0" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 space-y-3">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-7 w-full rounded" />)}
            <Skeleton className="h-4 w-20 mt-4" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-full rounded" />)}
          </div>
          <div className="flex-1">
            <Skeleton className="mb-4 h-4 w-28" />
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product detail skeleton ──────────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-16 rounded" />)}
            </div>
          </div>
          {/* Info */}
          <div className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-5 w-20 rounded" />
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin table skeleton ─────────────────────────────────────────────────────
export function AdminTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3.5">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <Skeleton className={`h-4 ${j === 0 ? 'w-28' : j === cols - 1 ? 'w-16' : 'w-full max-w-[100px]'}`} />
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

// ─── Admin stat cards skeleton ────────────────────────────────────────────────
export function AdminStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14" />
            </div>
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Generic page content skeleton (services, about, gallery, etc.) ───────────
export function ContentPageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHeaderSkeleton />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
