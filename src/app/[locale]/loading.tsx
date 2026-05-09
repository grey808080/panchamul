import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';

// Home page loading — mirrors: dark hero + trust strip + categories + featured products + CTA
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero — dark surface */}
      <div className="bg-surface-bg px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl max-w-xl space-y-4">
          <Skeleton dark className="h-5 w-48" />
          <Skeleton dark className="h-12 w-full sm:w-4/5" />
          <Skeleton dark className="h-12 w-3/4" />
          <Skeleton dark className="h-4 w-64 mt-1" />
          <div className="flex gap-3 pt-2">
            <Skeleton dark className="h-11 w-32 rounded-lg" />
            <Skeleton dark className="h-11 w-36 rounded-lg" />
          </div>
          <div className="flex gap-8 pt-6 border-t border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton dark className="h-7 w-12" />
                <Skeleton dark className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl grid grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-5">
              <Skeleton className="h-10 w-10 rounded shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="py-14 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col items-center gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-0.5 w-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="py-14 px-4 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-44" />
            </div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>

      {/* CTA strip */}
      <div className="bg-surface-bg border-t border-surface-border px-4 py-10">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-surface-border bg-surface-card p-5">
              <Skeleton dark className="h-10 w-10 rounded shrink-0" />
              <div className="space-y-1.5">
                <Skeleton dark className="h-4 w-32" />
                <Skeleton dark className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
