import { Skeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';

export default function ElectriciansLoading() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeaderSkeleton />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              {/* Photo area */}
              <Skeleton className="h-40 w-full rounded-none" />
              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3].map((j) => <Skeleton key={j} className="h-5 w-16 rounded" />)}
                  </div>
                </div>
                <Skeleton className="h-9 w-full rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded" />
                  <Skeleton className="h-9 flex-1 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
