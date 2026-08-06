import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PreviewCard {
  emoji: string;
  title: string;
  subtitle: string;
  accent: string;
  items: string[];
}

const CARDS: PreviewCard[] = [
  {
    emoji: '🌅',
    title: 'Morning Brief',
    subtitle: 'AI-powered daily digest',
    accent: '#6366F1',
    items: ['Weather forecast', "Today's itinerary", 'Budget status'],
  },
  {
    emoji: '💰',
    title: 'Budget Tracker',
    subtitle: 'Every rupee accounted for',
    accent: '#F59E0B',
    items: ['₹ 48,300 total', 'Group split', 'Live rates'],
  },
  {
    emoji: '🗺️',
    title: 'Trip Itinerary',
    subtitle: 'Day-by-day planning',
    accent: '#10B981',
    items: ['Drag & drop', 'Collaboration', 'Offline access'],
  },
  {
    emoji: '🎒',
    title: 'Packing List',
    subtitle: 'AI-tailored checklist',
    accent: '#8B5CF6',
    items: ['Weather-aware', 'Trip-specific', 'Shareable'],
  },
  {
    emoji: '🛡️',
    title: 'Safety Advisor',
    subtitle: 'Travel smart',
    accent: '#EF4444',
    items: ['Emergency numbers', 'Area alerts', 'Health tips'],
  },
];

export function ProductPreviewStrip() {
  const reduced = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="preview"
      className="overflow-hidden py-16"
      style={{ background: '#FAFAF7' }}
      aria-label="Product preview"
    >
      <div className="mx-auto mb-10 max-w-6xl px-5 text-center">
        <span className="mb-3 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-700">
          What's inside
        </span>
        <h2 className="text-[28px] font-bold tracking-tight text-gray-900 sm:text-[36px]">
          Everything you need for a great trip
        </h2>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto px-5 pb-4 sm:px-8"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        role="list"
        aria-label="App feature previews"
      >
        {/* Double the cards for infinite-feel scroll */}
        {[...CARDS, ...CARDS].map((card, i) => (
          <motion.div
            key={i}
            role="listitem"
            className="flex-shrink-0 cursor-default select-none overflow-hidden rounded-2xl bg-white"
            style={{
              width: 200,
              minHeight: 280,
              scrollSnapAlign: 'start',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
            animate={
              reduced
                ? {}
                : {
                    x: [0, -(CARDS.length * 216)],
                  }
            }
            transition={
              reduced
                ? {}
                : {
                    x: {
                      duration: 28,
                      ease: 'linear',
                      repeat: Infinity,
                      repeatType: 'loop',
                    },
                  }
            }
          >
            {/* Card header bar */}
            <div
              className="flex items-center gap-2.5 px-4 py-4"
              style={{ background: card.accent + '12' }}
            >
              <span className="text-2xl" aria-hidden="true">
                {card.emoji}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{card.title}</p>
                <p className="text-[11px] text-gray-400">{card.subtitle}</p>
              </div>
            </div>
            {/* Items */}
            <ul className="space-y-2.5 px-4 py-3">
              {card.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] text-gray-600">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: card.accent }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
