import { motion, useReducedMotion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Ambulance,
  Flame,
  Globe,
  Building2,
  Hospital,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  rv,
  CARD_VARIANTS,
  LIST_VARIANTS,
  LIST_ITEM_VARIANTS,
  SECTION_VARIANTS,
} from '@/lib/motion';
import type { SafetyInfo, SafetyRating } from '../types';

interface Props {
  safety: SafetyInfo;
  destination: string;
}

const RATING_META: Record<
  SafetyRating,
  { label: string; icon: typeof ShieldCheck; cls: string; bg: string }
> = {
  'very-safe': {
    label: 'Very Safe',
    icon: ShieldCheck,
    cls: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  safe: {
    label: 'Safe',
    icon: ShieldCheck,
    cls: 'text-green-600  dark:text-green-400',
    bg: 'bg-green-500/10  border-green-500/20',
  },
  moderate: {
    label: 'Moderate',
    icon: Shield,
    cls: 'text-amber-600  dark:text-amber-400',
    bg: 'bg-amber-500/10  border-amber-500/20',
  },
  caution: {
    label: 'Caution',
    icon: ShieldAlert,
    cls: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  'high-risk': {
    label: 'High Risk',
    icon: ShieldAlert,
    cls: 'text-red-600    dark:text-red-400',
    bg: 'bg-red-500/10    border-red-500/20',
  },
};

const EMERGENCY_CARDS = [
  { key: 'police' as const, label: 'Police', icon: Shield, color: 'rgb(59,130,246)' },
  { key: 'ambulance' as const, label: 'Ambulance', icon: Ambulance, color: 'rgb(239,68,68)' },
  { key: 'fire' as const, label: 'Fire', icon: Flame, color: 'rgb(249,115,22)' },
  { key: 'general' as const, label: 'General / SOS', icon: Phone, color: 'rgb(139,92,246)' },
];

export function SafetySection({ safety, destination }: Props) {
  const reduced = useReducedMotion();
  const rating = RATING_META[safety.overallRating];
  const RatingIcon = rating.icon;

  return (
    <section id="safety" aria-label={`Safety information for ${destination}`} className="space-y-6">
      {/* Header + overall rating */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Safety</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Emergency contacts, local tips, and cultural etiquette
          </p>
        </div>
        <motion.div
          className={`flex items-center gap-2 rounded-full border px-4 py-2 ${rating.bg}`}
          variants={rv(CARD_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          <RatingIcon className={`h-4 w-4 ${rating.cls}`} aria-hidden />
          <span className={`text-sm font-bold ${rating.cls}`}>{rating.label}</span>
        </motion.div>
      </div>

      {/* Rating note */}
      {safety.ratingNote && (
        <motion.p
          className="rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
          variants={rv(SECTION_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {safety.ratingNote}
        </motion.p>
      )}

      {/* Emergency numbers */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Emergency Numbers
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EMERGENCY_CARDS.map(({ key, label, icon: Icon, color }) => {
            const number = safety.emergency[key];
            if (!number) return null;
            const [r, g, b] = color.replace('rgb(', '').replace(')', '').split(',').map(Number);
            return (
              <motion.div
                key={key}
                className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card p-4"
                style={{
                  borderColor: `rgba(${r},${g},${b},0.2)`,
                  boxShadow: `0 2px 12px -4px rgba(${r},${g},${b},0.1)`,
                }}
                variants={rv(CARD_VARIANTS, reduced)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `rgba(${r},${g},${b},0.12)` }}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  <p
                    className="mt-0.5 text-2xl font-black tabular-nums tracking-tight"
                    style={{ color }}
                    aria-label={`${label}: ${number}`}
                  >
                    {number}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tourist helpline — full-width accent card */}
        {safety.emergency.touristHelpline && (
          <motion.div
            className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
            variants={rv(SECTION_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Globe className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Tourist Helpline
              </span>
              <span className="font-bold text-foreground">{safety.emergency.touristHelpline}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hospitals + Embassies row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Hospitals */}
        {safety.hospitals.length > 0 && (
          <div>
            <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Hospital className="h-3.5 w-3.5" aria-hidden />
              Nearby Hospitals
            </h3>
            <motion.ul
              className="space-y-2"
              variants={rv(LIST_VARIANTS, reduced)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {safety.hospitals.map((h) => (
                <motion.li
                  key={h.name}
                  className="rounded-xl border border-border/40 bg-card p-3"
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                >
                  <p className="text-xs font-semibold text-foreground">{h.name}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{h.area}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}

        {/* Embassies */}
        {safety.embassies.length > 0 && (
          <div>
            <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              Embassy Contacts
            </h3>
            <motion.ul
              className="space-y-2"
              variants={rv(LIST_VARIANTS, reduced)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {safety.embassies.map((e) => (
                <motion.li
                  key={e.country}
                  className="rounded-xl border border-border/40 bg-card p-3"
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                >
                  <p className="text-xs font-semibold text-foreground">{e.country}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{e.phone}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}
      </div>

      {/* Safety tips */}
      {safety.tips.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Safety Tips
          </h3>
          <motion.ul
            className="grid gap-2 sm:grid-cols-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {safety.tips.map((tip, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3.5 text-sm text-foreground"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="leading-relaxed">{tip}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {/* Scam awareness */}
      {safety.scams.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Scam Awareness
          </h3>
          <motion.ul
            className="space-y-2.5"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {safety.scams.map((scam, i) => {
              const [title, ...rest] = scam.split(': ');
              const body = rest.join(': ');
              return (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5"
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  <div className="text-sm leading-relaxed">
                    {body ? (
                      <>
                        <span className="font-semibold text-foreground">{title}: </span>
                        <span className="text-muted-foreground">{body}</span>
                      </>
                    ) : (
                      <span className="text-foreground">{title}</span>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      {/* Areas to avoid */}
      {safety.avoidAreas.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Areas to Avoid
          </h3>
          <ul className="space-y-1.5">
            {safety.avoidAreas.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400"
                  aria-hidden
                />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Etiquette */}
      {safety.etiquette.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Local Etiquette
          </h3>
          <motion.ul
            className="grid gap-2 sm:grid-cols-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-20px' }}
          >
            {safety.etiquette.map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3.5 text-sm"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <span className="mt-0.5 text-base leading-none" aria-hidden>
                  🙏
                </span>
                <span className="leading-relaxed text-muted-foreground">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
    </section>
  );
}
