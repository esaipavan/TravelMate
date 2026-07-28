import { MapPin, Navigation, Layers } from 'lucide-react';
import type { DestinationOverview } from '../types';

interface Props {
  overview: DestinationOverview;
}

export function MapPreview({ overview }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
      role="region"
      aria-label="Map preview"
    >
      {/* Topographic grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: [
            'linear-gradient(to right, currentColor 1px, transparent 1px)',
            'linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '36px 36px',
        }}
        aria-hidden
      />

      {/* Decorative concentric rings */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-[0.04]"
        aria-hidden
      >
        <div className="mr-12 flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full border-2 border-foreground" />
          <div className="absolute h-56 w-56 rounded-full border border-foreground" />
          <div className="absolute h-80 w-80 rounded-full border border-foreground" />
          <div className="absolute h-[420px] w-[420px] rounded-full border border-foreground" />
        </div>
      </div>

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <MapPin className="h-7 w-7 text-primary" aria-hidden />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" role="img" aria-label={overview.country}>
              {overview.flagEmoji}
            </span>
            <h2 className="text-base font-bold">
              {overview.destination}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {overview.country}
              </span>
            </h2>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="font-mono">Coordinates · {overview.timezoneOffset}</span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Interactive map with points of interest, transit overlays, and offline navigation coming
            in a future update.
          </p>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="bg-primary/8 flex items-center gap-1.5 rounded-full border border-primary/25 px-3 py-1">
            <Layers className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-medium text-primary">Maps coming soon</span>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            Google Maps · Mapbox · OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  );
}
