import { Skeleton } from '@/components/ui/skeleton';

export function ExplorerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Category bar */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Main split */}
      <div className="flex gap-6">
        {/* Left list */}
        <div className="w-96 shrink-0 space-y-3">
          {/* AI panel skeleton */}
          <Skeleton className="h-36 rounded-2xl" />
          {/* Cards */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Map */}
        <Skeleton className="hidden flex-1 rounded-2xl lg:block" style={{ minHeight: 500 }} />
      </div>

      {/* Mobile map skeleton */}
      <Skeleton className="h-56 rounded-2xl lg:hidden" />
    </div>
  );
}
