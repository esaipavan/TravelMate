import { useRef } from 'react';
import type { DestinationCategory } from '../types';
import { CATEGORIES } from '../data/destinations';

interface CategoryTabsProps {
  activeCategory: DestinationCategory;
  onCategoryChange: (cat: DestinationCategory) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, currentIdx: number) {
    let nextIdx = currentIdx;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % CATEGORIES.length;
    else if (e.key === 'ArrowLeft')
      nextIdx = (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = CATEGORIES.length - 1;
    else return;

    e.preventDefault();
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIdx]?.focus();
    onCategoryChange(CATEGORIES[nextIdx].id);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Destination category"
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {CATEGORIES.map((cat, idx) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            role="tab"
            id={`cat-tab-${cat.id}`}
            aria-selected={isActive}
            aria-controls={`cat-panel-${cat.id}`}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onClick={() => onCategoryChange(cat.id)}
            className={[
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2',
              'text-[13px] font-semibold transition-all duration-150',
              'min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
            ].join(' ')}
            style={
              isActive
                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }
            }
          >
            <span aria-hidden="true" className="text-base leading-none">
              {cat.emoji}
            </span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
