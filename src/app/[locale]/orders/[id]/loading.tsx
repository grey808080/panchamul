import { Skeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {/* Status stepper */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
              <Skeleton className="h-5 w-24" />
              <div className="hidden sm:flex items-start justify-between">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
              {/* Mobile vertical */}
              <div className="sm:hidden space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
              <Skeleton className="h-5 w-24" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between py-3 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <Skeleton className="h-5 w-28" />
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
