import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  view: 'grid' | 'list';
}

export function TripsSkeleton({ view }: Props) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4"
          >
            <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl">
          <Skeleton className="h-[280px] w-full" />
        </div>
      ))}
    </div>
  );
}
