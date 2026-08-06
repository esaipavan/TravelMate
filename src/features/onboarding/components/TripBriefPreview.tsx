import { motion, useReducedMotion } from 'framer-motion';
import { Sun, Package, FileText, Wallet, ArrowRight, MapPin } from 'lucide-react';
import type { TripBriefPayload } from '@/services/ai/ai.types';

// ── Local rendering types (narrow the unknown fields from ai.types) ────────────

interface DayActivity {
  title?: string;
  activities?: unknown[];
  tips?: unknown[];
}

interface WeatherInfo {
  expected?: string;
  temperature_range?: string;
  clothing_advice?: string;
  alerts?: unknown[];
}

interface PackingGroup {
  category?: string;
  items?: unknown[];
}

interface BudgetInfo {
  total_inr?: number;
  accommodation_inr?: number;
  food_inr?: number;
  transport_inr?: number;
  activities_inr?: number;
  notes?: string;
}

// ── Type guards ───────────────────────────────────────────────────────────────

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asObj<T>(v: unknown): Partial<T> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Partial<T>) : {};
}

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function formatInr(n: unknown): string | null {
  const num = typeof n === 'number' ? n : typeof n === 'string' ? parseFloat(n) : NaN;
  if (!isFinite(num) || num <= 0) return null;
  return `₹${num.toLocaleString('en-IN')}`;
}

// ── Section components ────────────────────────────────────────────────────────

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;
const CARD_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

function SectionHead({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: 'rgba(99,102,241,0.18)' }}
      >
        <Icon className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
      </div>
      <span className="text-[12px] font-bold uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TripBriefPreviewProps {
  destination: string;
  payload: TripBriefPayload;
  onContinue: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TripBriefPreview({ destination, payload, onContinue }: TripBriefPreviewProps) {
  const reduced = useReducedMotion() ?? false;

  const weather = asObj<WeatherInfo>(payload.weather_summary);
  const budget = asObj<BudgetInfo>(payload.budget_estimate);
  const day1 = asArr(payload.day_one_itinerary)[0];
  const day1Obj = asObj<DayActivity>(day1);
  const day1Activities = asArr(day1Obj.activities).map(asString).filter(Boolean);
  const packingGroups = asArr(payload.packing_checklist).slice(0, 3);
  const topDocuments = payload.required_documents.slice(0, 5);
  const totalInr = formatInr(budget.total_inr);

  return (
    <div
      className="flex flex-1 flex-col overflow-auto px-5 pb-4"
      role="region"
      aria-label="Your AI-generated trip brief"
    >
      {/* Header */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-5"
      >
        <div className="mb-1 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
            AI Trip Brief · {destination}
          </span>
        </div>
        <p className="text-[15px] leading-snug text-white/80">{payload.trip_summary}</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {/* Day 1 plan */}
        {day1Activities.length > 0 && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
            className="rounded-2xl p-4"
            style={CARD_STYLE}
          >
            <SectionHead icon={MapPin} label="Day 1 plan" />
            <p className="mb-2 text-[13px] font-semibold text-white/70">
              {asString(day1Obj.title) || 'Arrival day'}
            </p>
            <ul className="flex flex-col gap-1.5" role="list">
              {day1Activities.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"
                    aria-hidden="true"
                  />
                  <span className="text-[13px]" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    {act}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Weather */}
        {weather.expected && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.16 }}
            className="rounded-2xl p-4"
            style={CARD_STYLE}
          >
            <SectionHead icon={Sun} label="Weather" />
            <p className="text-[13px] text-white/70">{weather.expected}</p>
            {weather.temperature_range && (
              <p className="mt-1 text-[12px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                {weather.temperature_range}
              </p>
            )}
            {weather.clothing_advice && (
              <p className="mt-1.5 text-[12px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
                Tip: {weather.clothing_advice}
              </p>
            )}
          </motion.div>
        )}

        {/* Packing */}
        {packingGroups.length > 0 && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.22 }}
            className="rounded-2xl p-4"
            style={CARD_STYLE}
          >
            <SectionHead icon={Package} label="What to pack" />
            <div className="flex flex-col gap-2">
              {packingGroups.map((group, gi) => {
                const g = asObj<PackingGroup>(group);
                const items = asArr(g.items).map(asString).filter(Boolean).slice(0, 4);
                if (!items.length) return null;
                return (
                  <div key={gi}>
                    {g.category && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                        {asString(g.category)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item, ii) => (
                        <span
                          key={ii}
                          className="rounded-lg px-2 py-0.5 text-[11px] text-white/60"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Documents */}
        {topDocuments.length > 0 && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.28 }}
            className="rounded-2xl p-4"
            style={CARD_STYLE}
          >
            <SectionHead icon={FileText} label="Don't forget" />
            <ul className="flex flex-col gap-1" role="list">
              {topDocuments.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-white/65">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                    aria-hidden="true"
                  />
                  {doc}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Budget estimate */}
        {totalInr && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.34 }}
            className="rounded-2xl p-4"
            style={CARD_STYLE}
          >
            <SectionHead icon={Wallet} label="Estimated budget" />
            <p className="text-[22px] font-black text-white">{totalInr}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {(
                [
                  ['Stay', budget.accommodation_inr],
                  ['Food', budget.food_inr],
                  ['Travel', budget.transport_inr],
                  ['Activities', budget.activities_inr],
                ] as [string, unknown][]
              )
                .map(([k, v]) => [k, formatInr(v)] as [string, string | null])
                .filter(([, v]) => v !== null)
                .map(([k, v]) => (
                  <span key={k} className="text-[12px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    {k}: {v}
                  </span>
                ))}
            </div>
            {budget.notes && (
              <p className="mt-2 text-[11px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
                {budget.notes}
              </p>
            )}
          </motion.div>
        )}

        {/* Safety note */}
        {payload.safety_advice && (
          <motion.p
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
            style={{
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.18)',
              color: 'rgba(253,230,138,0.75)',
            }}
          >
            ⚠️ {payload.safety_advice}
          </motion.p>
        )}
      </div>

      {/* CTA */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.45 }}
        className="mt-6 pt-2"
      >
        <button
          type="button"
          onClick={onContinue}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600',
            'text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          ].join(' ')}
        >
          Continue to Dashboard
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="mt-2 text-center text-[11px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
          Full brief, itinerary builder, and budget tracker await
        </p>
      </motion.div>
    </div>
  );
}
