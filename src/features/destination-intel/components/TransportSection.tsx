import { motion, useReducedMotion } from 'framer-motion';
import { Plane, CheckCircle2, Smartphone } from 'lucide-react';
import {
  rv,
  CARD_VARIANTS,
  LIST_VARIANTS,
  LIST_ITEM_VARIANTS,
  SECTION_VARIANTS,
} from '@/lib/motion';
import type { TransportGuide, TransportOption, TransportMode } from '../types';

interface Props {
  transport: TransportGuide;
  destination: string;
}

const MODE_COLOR: Partial<Record<TransportMode, string>> = {
  airport: 'rgb(99,102,241)', // indigo
  metro: 'rgb(14,165,233)', // sky
  train: 'rgb(139,92,246)', // violet
  taxi: 'rgb(249,115,22)', // orange
  bus: 'rgb(34,197,94)', // green
  'car-rental': 'rgb(245,158,11)', // amber
  'ride-share': 'rgb(236,72,153)', // pink
  'tuk-tuk': 'rgb(234,179,8)', // yellow
  ferry: 'rgb(6,182,212)', // cyan
  boat: 'rgb(6,182,212)', // cyan
  seaplane: 'rgb(168,85,247)', // purple
};

function getModeColor(mode: TransportMode): string {
  return MODE_COLOR[mode] ?? 'rgb(100,116,139)';
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        available
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {available ? 'Available' : 'Limited'}
    </span>
  );
}

function TransportCard({ option }: { option: TransportOption }) {
  const reduced = useReducedMotion();
  const rgb = getModeColor(option.mode);
  const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',').map(Number);

  return (
    <motion.div
      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
      style={{
        borderColor: `rgba(${r},${g},${b},0.18)`,
        boxShadow: `0 2px 12px -4px rgba(${r},${g},${b},0.08)`,
      }}
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-30px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: `rgba(${r},${g},${b},0.12)` }}
            aria-hidden
          >
            {option.emoji}
          </div>
          <div>
            <p className="text-sm font-bold leading-snug text-foreground">{option.label}</p>
            <p className="text-[11px] font-semibold" style={{ color: rgb }}>
              {option.avgCostStr}
            </p>
          </div>
        </div>
        <AvailabilityBadge available={option.available} />
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-muted-foreground">{option.description}</p>

      {/* Tips */}
      {option.tips.length > 0 && (
        <ul className="space-y-1.5">
          {option.tips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground"
            >
              <span className="mt-0.5 shrink-0 font-bold text-primary" aria-hidden>
                ›
              </span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export function TransportSection({ transport, destination }: Props) {
  const reduced = useReducedMotion();

  if (!transport.fromAirport && transport.options.length === 0) return null;

  return (
    <section id="transport" aria-label={`Local transport in ${destination}`} className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Local Transport</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Getting around {destination} — from the airport and beyond
        </p>
      </div>

      {/* From Airport */}
      {transport.fromAirport && (
        <motion.div
          className="flex items-start gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5"
          variants={rv(SECTION_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-30px' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Plane className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              From the Airport
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground">
              {transport.fromAirport}
            </p>
          </div>
        </motion.div>
      )}

      {/* Transport mode cards */}
      {transport.options.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Getting Around
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transport.options.map((opt) => (
              <TransportCard key={opt.label} option={opt} />
            ))}
          </div>
        </div>
      )}

      {/* Apps */}
      {transport.apps.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Useful Apps
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {transport.apps.map((app) => (
              <div
                key={app.name}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-3.5 py-2.5"
                title={app.note}
              >
                <span className="text-base leading-none" aria-hidden>
                  {app.emoji}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{app.name}</p>
                  <p className="mt-0.5 max-w-[180px] text-[10px] leading-tight text-muted-foreground">
                    {app.note}
                  </p>
                </div>
                <Smartphone
                  className="ml-1 h-3 w-3 shrink-0 text-muted-foreground/50"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General tips */}
      {transport.tips.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Local Tips
          </h3>
          <motion.ul
            className="grid gap-2 sm:grid-cols-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {transport.tips.map((tip, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5 text-sm text-foreground"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{tip}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </section>
  );
}
