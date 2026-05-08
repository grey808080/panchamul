import { ProductDetailSkeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ProductDetailSkeleton />
    </div>
  );
}
