import { memo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Wallet,
  Receipt,
  Map,
  CheckSquare,
  BookOpen,
  FileDown,
  FolderOpen,
  Bot,
  Globe,
  Camera,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/* ── Card config ──────────────────────────────────────────────── */
interface CardDef {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  rgb: string;
}

function buildCards(tripId: string): CardDef[] {
  return [
    {
      label: 'Prepare',
      description: 'Documents, packing, trip guide',
      href: `/trips/${tripId}/prepare`,
      icon: Sparkles,
      rgb: '99,102,241',
    },
    {
      label: 'Budget',
      description: 'Set budgets by category',
      href: `/trips/${tripId}/budget`,
      icon: Wallet,
      rgb: '99,102,241',
    },
    {
      label: 'Expenses',
      description: 'Log every transaction',
      href: `/trips/${tripId}/expenses`,
      icon: Receipt,
      rgb: '16,185,129',
    },
    {
      label: 'Itinerary',
      description: 'Day-by-day plan',
      href: `/trips/${tripId}/itinerary`,
      icon: Map,
      rgb: '245,158,11',
    },
    {
      label: 'Checklist',
      description: 'Packing lists and to-dos',
      href: `/trips/${tripId}/checklist`,
      icon: CheckSquare,
      rgb: '236,72,153',
    },
    {
      label: 'Journal',
      description: 'Memories and photos',
      href: `/trips/${tripId}/journal`,
      icon: BookOpen,
      rgb: '6,182,212',
    },
    {
      label: 'Export',
      description: 'Download PDF or CSV',
      href: `/trips/${tripId}/export`,
      icon: FileDown,
      rgb: '132,204,22',
    },
    {
      label: 'Documents',
      description: 'Passports and bookings',
      href: `/trips/${tripId}/documents`,
      icon: FolderOpen,
      rgb: '249,115,22',
    },
    {
      label: 'AI Assistant',
      description: 'Recommendations and answers',
      href: `/assistant?tripId=${tripId}`,
      icon: Bot,
      rgb: '168,85,247',
    },
    {
      label: 'Destination',
      description: 'Travel guide & destination intel',
      href: `/trips/${tripId}/destination-intel`,
      icon: Globe,
      rgb: '14,165,233',
    },
    {
      label: 'Memories',
      description: 'Gallery, journal & timeline',
      href: `/trips/${tripId}/memories`,
      icon: Camera,
      rgb: '244,63,94',
    },
  ];
}

/* ── NavCard ──────────────────────────────────────────────────── */
const NavCard = memo(function NavCard({ def, index }: { def: CardDef; index: number }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sp = { damping: 20, stiffness: 220 };
  const rotY = useSpring(useTransform(mx, [0, 1], [-8, 8]), sp);
  const rotX = useSpring(useTransform(my, [0, 1], [8, -8]), sp);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  };

  const { icon: Icon, label, description, href, rgb } = def;

  const ITEM = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, damping: 22, stiffness: 120, delay: index * 0.05 },
    },
  };

  return (
    <motion.div variants={reduced ? undefined : ITEM}>
      <div
        ref={wrapRef}
        style={{ perspective: '700px' }}
        onMouseMove={reduced ? undefined : onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={() => setHovered(true)}
      >
        <Link
          to={href}
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <motion.div
            className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card p-4 shadow-card"
            style={reduced ? undefined : { rotateX: rotX, rotateY: rotY }}
            whileHover={
              reduced
                ? {}
                : {
                    y: -5,
                    borderColor: `rgba(${rgb},0.35)`,
                    boxShadow: `0 16px 40px -8px rgba(${rgb},0.18), 0 4px 12px -4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }
            }
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
          >
            {/* Glass sweep on hover */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className="absolute inset-y-0 w-3/5 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-all duration-700"
                style={{ left: hovered ? '140%' : '-80%' }}
              />
            </div>

            {/* Icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200"
              style={{ background: `rgba(${rgb},0.12)` }}
            >
              <motion.div whileHover={reduced ? {} : { scale: 1.1, rotate: 6 }}>
                <Icon className="h-4 w-4" style={{ color: `rgb(${rgb})` }} aria-hidden />
              </motion.div>
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-foreground">{label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
            </div>

            {/* Arrow */}
            <ArrowRight
              className="absolute bottom-4 right-4 h-3.5 w-3.5 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:opacity-100"
              aria-hidden
            />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
});

/* ── TripSubNavGrid ───────────────────────────────────────────── */
interface Props {
  tripId: string;
}

const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
};

export function TripSubNavGrid({ tripId }: Props) {
  const reduced = useReducedMotion();
  const cards = buildCards(tripId);

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        Trip tools
      </p>
      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
        variants={reduced ? undefined : CONTAINER}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {cards.map((def, i) => (
          <NavCard key={def.label} def={def} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
