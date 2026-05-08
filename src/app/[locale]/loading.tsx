import { Skeleton } from '@/components/ui/Skeleton';

// Home page loading — mirrors HeroBanner + TrustBadges + FeaturedProducts + CategoryGrid
export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="min-h-[600px] bg-gradient-to-br from-primary via-primary-dark to-slate-900 flex items-center px-4">
        <div className="mx-auto max-w-7xl w-full space-y-6">
          <Skeleton className="h-8 w-64 rounded-full bg-white/10" />
          <Skeleton className="h-14 w-3/4 bg-white/10" />
          <Skeleton className="h-6 w-1/2 bg-white/10" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-36 rounded-2xl bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
      {/* Trust badges */}
      <div className="py-8 px-4 bg-white">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
      {/* Featured products */}
      <div className="py-16 px-4 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-8" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200/60 overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
