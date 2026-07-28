import { Skeleton } from '@/components/ui/skeleton';

function GlassCard({ className }: { className?: string }) {
  return <Skeleton className={`rounded-2xl border border-border/40 ${className ?? ''}`} />;
}

export function BudgetWorkspaceSkeleton() {
  return (
    <div className="space-y-8 pb-12" aria-busy="true" aria-label="Loading budget workspace">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="h-[120px]" />
        ))}
      </div>

      {/* Health meter */}
      <GlassCard className="h-[160px]" />

      {/* 2-col: donut + AI panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="h-[260px]" />
        <GlassCard className="h-[260px]" />
      </div>

      {/* Category grid */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="h-[110px]" />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <GlassCard className="h-[220px]" />

      {/* Transaction list */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="h-[64px]" />
        ))}
      </div>
    </div>
  );
}
