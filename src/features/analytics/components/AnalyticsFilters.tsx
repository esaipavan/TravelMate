import { X, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AnalyticsFilters } from '../types';
import { DEFAULT_ANALYTICS_FILTERS } from '../types';

interface TripOption {
  id: string;
  title: string;
}

interface Props {
  filters: AnalyticsFilters;
  trips: TripOption[];
  onChange: (f: AnalyticsFilters) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export function AnalyticsFilters({ filters, trips, onChange, onExportPDF, onExportCSV }: Props) {
  const hasFilter = !!filters.dateFrom || !!filters.dateTo || !!filters.tripId || !!filters.country;

  function set<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 print:hidden">
      {/* Date from */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={filters.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
        />
      </div>

      {/* Trip */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Trip</Label>
        <Select
          value={filters.tripId || '_all'}
          onValueChange={(v) => set('tripId', v === '_all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All trips</SelectItem>
            {trips.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Country / Destination</Label>
        <Input
          className="h-8 w-40 text-xs"
          placeholder="e.g. Japan"
          value={filters.country}
          onChange={(e) => set('country', e.target.value)}
        />
      </div>

      {/* Clear */}
      {hasFilter && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 self-end"
          onClick={() => onChange(DEFAULT_ANALYTICS_FILTERS)}
          aria-label="Clear filters"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Export buttons */}
      <div className="ml-auto flex items-end gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onExportCSV}>
          <Download className="h-3.5 w-3.5" />
          CSV
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={onExportPDF}>
          <FileText className="h-3.5 w-3.5" />
          PDF
        </Button>
      </div>
    </div>
  );
}
