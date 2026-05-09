import { AdminStatsSkeleton, AdminTableSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div>
      {/* Page title */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-32" />
      </div>

      {/* Stat cards */}
      <AdminStatsSkeleton />

      {/* Recent orders table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <Skeleton className="h-4 w-28" />
        </div>
        <AdminTableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}
