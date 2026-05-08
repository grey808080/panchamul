import { AdminStatsSkeleton, AdminTableSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-36" />
      <AdminStatsSkeleton />
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <Skeleton className="mb-4 h-6 w-32" />
        <AdminTableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}
