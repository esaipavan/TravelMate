import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Date range presets */}
      <div className="flex flex-wrap items-center gap-2">
        {[80, 72, 88, 72].map((w, i) => (
          <Skeleton key={i} className={`h-8 w-${w / 4} rounded-full`} style={{ width: w }} />
        ))}
        <Skeleton className="ml-auto h-8 w-36 rounded-xl" />
        <Skeleton className="h-8 w-36 rounded-xl" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mb-1.5 h-7 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>

      {/* Hero spending trend */}
      <Skeleton className="h-80 w-full rounded-2xl" />

      {/* 2×2 chart grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>

      {/* Destination ratings */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      {/* Insights grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
