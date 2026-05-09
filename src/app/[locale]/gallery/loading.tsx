import { Skeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeaderSkeleton />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {[48, 80, 72].map((w, i) => (
            <div key={i} style={{ width: w }}>
    <Skeleton className="h-8 rounded w-full" />
  </div>
          ))}
        </div>
        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {[180, 240, 160, 280, 200, 220, 170, 260, 190, 230, 150, 210].map((h, i) => (
            <div key={i} className="mb-4 break-inside-avoid" style={{ height: h }}>
              <Skeleton className="w-full rounded-lg"  />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
