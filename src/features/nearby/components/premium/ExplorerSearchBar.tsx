import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Search, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { rv, FADE_VARIANTS } from '@/lib/motion';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  hasResults: boolean;
  location?: string;
}

export function ExplorerSearchBar({
  value,
  onChange,
  onSearch,
  onRefresh,
  isLoading,
  hasResults,
  location,
}: Props) {
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search destination — e.g. Bali, Tokyo, Paris…"
            aria-label="Destination"
            className={cn(
              'h-10 w-full rounded-xl border border-border/60 bg-card/60 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground',
              'outline-none backdrop-blur-sm transition-all duration-200',
              'focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20',
            )}
          />
          {value && (
            <button
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search button */}
        <Button
          onClick={onSearch}
          disabled={!value.trim() || isLoading}
          className="bg-gradient-premium shrink-0 gap-1.5 text-white hover:opacity-90"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Explore</span>
        </Button>

        {/* Refresh */}
        {hasResults && onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh results"
            className="shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Resolved location label */}
      {location && (
        <motion.p
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"
        >
          <MapPin className="h-3 w-3 shrink-0 text-indigo-500" aria-hidden="true" />
          {location}
        </motion.p>
      )}
    </div>
  );
}
