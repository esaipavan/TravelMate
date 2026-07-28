import { useRef } from 'react';
import { Search, Clock, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOCUMENT_TYPES, type DocumentFilters } from '../../types';

interface Props {
  filters: DocumentFilters;
  onFiltersChange: (patch: Partial<DocumentFilters>) => void;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
  expiringSoonCount: number;
  trips: { id: string; title: string }[];
  showTripFilter: boolean;
}

export function DocumentFilterBar({
  filters,
  onFiltersChange,
  onClear,
  totalCount,
  filteredCount,
  expiringSoonCount,
  trips,
  showTripFilter,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  const hasActive = !!filters.search || !!filters.type || !!filters.tripId || filters.expiringSoon;

  return (
    <div className="space-y-3">
      {/* Primary row */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative min-w-48 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={searchRef}
            className="pl-9"
            placeholder="Search by title, country or notes…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Expiring toggle */}
        {expiringSoonCount > 0 && (
          <Button
            variant={filters.expiringSoon ? 'secondary' : 'outline'}
            size="sm"
            className={cn(
              'shrink-0 gap-1.5',
              filters.expiringSoon &&
                'border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400',
            )}
            onClick={() => onFiltersChange({ expiringSoon: !filters.expiringSoon })}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Expiring ({expiringSoonCount})
          </Button>
        )}

        {/* Sort */}
        <Select
          value={filters.sortOrder}
          onValueChange={(v) => onFiltersChange({ sortOrder: v as DocumentFilters['sortOrder'] })}
        >
          <SelectTrigger className="h-9 w-36 shrink-0">
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onClear}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFiltersChange({ type: '' })}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            !filters.type
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
          )}
        >
          All types
        </button>
        {DOCUMENT_TYPES.map((dt) => (
          <button
            key={dt.value}
            onClick={() => onFiltersChange({ type: filters.type === dt.value ? '' : dt.value })}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filters.type === dt.value
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {dt.emoji} {dt.label}
          </button>
        ))}
      </div>

      {/* Trip filter (only shown on /documents global page) */}
      {showTripFilter && trips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onFiltersChange({ tripId: '' })}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !filters.tripId
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            All trips
          </button>
          {trips.map((t) => (
            <button
              key={t.id}
              onClick={() => onFiltersChange({ tripId: filters.tripId === t.id ? '' : t.id })}
              className={cn(
                'max-w-40 truncate rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.tripId === t.id
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                  : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} ${totalCount === 1 ? 'document' : 'documents'}`
            : `${filteredCount} of ${totalCount} documents`}
        </p>
      )}
    </div>
  );
}
