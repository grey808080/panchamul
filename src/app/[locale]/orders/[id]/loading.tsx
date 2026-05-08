import { Skeleton } from '@/components/ui/Skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 space-y-4">
              <Skeleton className="h-5 w-24" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 space-y-4">
              <Skeleton className="h-5 w-24" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between py-3 border-b border-slate-100">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 space-y-3">
                <Skeleton className="h-5 w-32" />
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-4 w-full" />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
