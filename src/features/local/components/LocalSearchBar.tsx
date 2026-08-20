import { Search, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOCAL_VEHICLES, LOCAL_VEHICLE_LABEL } from '../types';
import type { LocalVehicle } from '../types';

interface Props {
  pickup: string;
  dropoff: string;
  dateTime: string;
  vehicle: LocalVehicle;
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onDateTimeChange: (v: string) => void;
  onVehicleChange: (v: LocalVehicle) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

// Local datetime string 'YYYY-MM-DDTHH:mm' for the input min.
const nowLocal = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export function LocalSearchBar({
  pickup,
  dropoff,
  dateTime,
  vehicle,
  onPickupChange,
  onDropoffChange,
  onDateTimeChange,
  onVehicleChange,
  onSearch,
  isLoading,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
            aria-hidden
          />
          <Input
            value={pickup}
            onChange={(e) => onPickupChange(e.target.value)}
            placeholder="Pickup"
            aria-label="Pickup location"
            className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <ArrowRight
          className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden
        />
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500"
            aria-hidden
          />
          <Input
            value={dropoff}
            onChange={(e) => onDropoffChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
            placeholder="Dropoff"
            aria-label="Dropoff location"
            className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="datetime-local"
            value={dateTime}
            min={nowLocal()}
            onChange={(e) => onDateTimeChange(e.target.value)}
            aria-label="Pickup date and time"
            className="h-11 pl-9"
          />
        </div>
        <select
          value={vehicle}
          onChange={(e) => onVehicleChange(e.target.value as LocalVehicle)}
          aria-label="Vehicle type"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {LOCAL_VEHICLES.map((v) => (
            <option key={v} value={v}>
              {LOCAL_VEHICLE_LABEL[v]}
            </option>
          ))}
        </select>
        <Button
          onClick={onSearch}
          disabled={!pickup.trim() || !dropoff.trim() || isLoading}
          className="h-11 gap-2"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search
        </Button>
      </div>
    </div>
  );
}
