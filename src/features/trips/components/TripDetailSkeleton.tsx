import { Skeleton } from '@/components/ui/skeleton';

export function TripDetailSkeleton() {
  return (
    <div>
      {/* Hero */}
      <div className="-mx-4 sm:-mx-6">
        <Skeleton className="h-[50vmin] max-h-[500px] min-h-[280px] w-full rounded-none" />
      </div>

      <div className="space-y-5 pt-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>

        {/* Info row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>

        {/* Nav grid */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* AI panel */}
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
