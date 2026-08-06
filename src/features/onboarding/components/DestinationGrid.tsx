import { useRef, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import type { DestinationCategory } from '../types';
import { getDestinations } from '../data/destinations';

interface DestinationGridProps {
  category: DestinationCategory;
  selected: string | null;
  onSelect: (name: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
}

export function DestinationGrid({
  category,
  selected,
  onSelect,
  customValue,
  onCustomChange,
}: DestinationGridProps) {
  const customRef = useRef<HTMLInputElement>(null);
  const destinations = getDestinations(category);

  // Focus the custom input when switching to custom category
  useEffect(() => {
    if (category === 'custom') {
      customRef.current?.focus();
    }
  }, [category]);

  if (category === 'custom') {
    return (
      <div id={`cat-panel-${category}`} role="tabpanel" aria-labelledby={`cat-tab-${category}`}>
        <label
          htmlFor="custom-destination-input"
          className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
        >
          Enter your destination
        </label>
        <div className="relative">
          <MapPin
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            aria-hidden="true"
          />
          <input
            ref={customRef}
            id="custom-destination-input"
            type="text"
            value={customValue}
            onChange={(e) => {
              onCustomChange(e.target.value);
              if (e.target.value.trim()) onSelect(e.target.value.trim());
            }}
            placeholder="e.g. Coorg, Rishikesh, Bhutan, Europe…"
            className={[
              'w-full rounded-xl py-3.5 pl-10 pr-4 text-[14px] text-white',
              'placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all',
            ].join(' ')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: '44px',
            }}
            autoComplete="off"
            aria-required="true"
          />
        </div>
        <p className="mt-2 text-[12px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
          Type any destination — city, region, or country
        </p>
      </div>
    );
  }

  function handleKeyDown(e: React.KeyboardEvent, currentIdx: number) {
    const cards = destinations;
    let nextIdx = currentIdx;

    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % cards.length;
    else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + cards.length) % cards.length;
    else if (e.key === 'ArrowDown') nextIdx = Math.min(currentIdx + 2, cards.length - 1);
    else if (e.key === 'ArrowUp') nextIdx = Math.max(currentIdx - 2, 0);
    else return;

    e.preventDefault();
    const el = document.getElementById(`dest-card-${cards[nextIdx].id}`);
    el?.focus();
  }

  return (
    <div
      id={`cat-panel-${category}`}
      role="radiogroup"
      aria-label={`${category.replace('_', ' ')} destinations`}
      className="grid grid-cols-2 gap-2"
    >
      {destinations.map((dest, idx) => {
        const isSelected = selected === dest.name;
        return (
          <button
            key={dest.id}
            id={`dest-card-${dest.id}`}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onClick={() => onSelect(dest.name)}
            className={[
              'relative flex flex-col items-start gap-1 rounded-2xl p-3 text-left',
              'transition-all duration-150',
              'min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              isSelected ? 'border-indigo-500/50' : 'hover:border-white/15',
            ].join(' ')}
            style={{
              background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
              border: isSelected
                ? '1px solid rgba(99,102,241,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {isSelected && (
              <div
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: '#6366f1' }}
                aria-hidden="true"
              >
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-xl leading-none" aria-hidden="true">
              {dest.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">{dest.name}</p>
              <p className="truncate text-[11px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                {dest.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
