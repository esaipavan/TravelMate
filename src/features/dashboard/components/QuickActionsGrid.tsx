import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { PlaneTakeoff, Sparkles, ReceiptText, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Action {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  gradient: string;
  glow: string;
  glowRgba: string;
}

const ACTIONS: Action[] = [
  {
    icon: PlaneTakeoff,
    label: 'New Trip',
    description: 'Plan your next adventure',
    href: '/trips/new',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.4)',
    glowRgba: '59,130,246',
  },
  {
    icon: Sparkles,
    label: 'AI Assistant',
    description: 'Get travel advice instantly',
    href: '/assistant',
    gradient: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.4)',
    glowRgba: '139,92,246',
  },
  {
    icon: ReceiptText,
    label: 'Add Expense',
    description: 'Track your spending',
    href: '/trips',
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.4)',
    glowRgba: '16,185,129',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'View travel insights',
    href: '/analytics',
    gradient: 'from-amber-500 to-orange-400',
    glow: 'rgba(245,158,11,0.4)',
    glowRgba: '245,158,11',
  },
];

interface RippleItem {
  id: number;
  x: number;
  y: number;
  s: number;
}

function ActionCard({ action, index }: { action: Action; index: number }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springConfig = { damping: 18, stiffness: 200 };
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), springConfig);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), springConfig);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  };

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.max(rect.width, rect.height) * 2.2;
    const id = performance.now();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left - s / 2, y: e.clientY - rect.top - s / 2, s },
    ]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  };

  const ITEM = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, damping: 22, stiffness: 120, delay: index * 0.07 },
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
        onMouseDown={reduced ? undefined : addRipple}
        className="h-full"
      >
        <Link
          to={action.href}
          className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <motion.div
            className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-card"
            style={reduced ? undefined : { rotateX, rotateY }}
            whileHover={
              reduced
                ? {}
                : {
                    y: -5,
                    borderColor: `rgba(${action.glowRgba}, 0.4)`,
                    boxShadow: `0 24px 56px ${action.glow}, 0 6px 18px ${action.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  }
            }
            whileTap={reduced ? {} : { scale: 0.96 }}
            transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          >
            {/* Ripples */}
            <AnimatePresence>
              {ripples.map((rpl) => (
                <motion.span
                  key={rpl.id}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: rpl.x,
                    top: rpl.y,
                    width: rpl.s,
                    height: rpl.s,
                    background: `radial-gradient(circle, rgba(${action.glowRgba},0.28) 0%, transparent 70%)`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Light sweep on hover */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className="absolute inset-y-0 w-3/5 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-all duration-700"
                style={{ left: hovered ? '140%' : '-80%' }}
              />
            </div>

            {/* Top-right glow dot */}
            <div
              className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `rgba(${action.glowRgba}, 0.8)`,
                boxShadow: `0 0 6px rgba(${action.glowRgba}, 0.8)`,
              }}
            />

            {/* Icon */}
            <motion.div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}
              style={{
                boxShadow: hovered ? `0 4px 20px rgba(${action.glowRgba}, 0.5)` : undefined,
              }}
              whileHover={reduced ? {} : { scale: 1.12, rotate: 6 }}
              transition={{ type: 'spring', damping: 12, stiffness: 250 }}
            >
              <action.icon className="h-5 w-5 text-white" />
            </motion.div>

            {/* Labels */}
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{action.description}</p>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export function QuickActionsGrid() {
  const reduced = useReducedMotion();

  return (
    <section aria-label="Quick actions">
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={reduced ? undefined : CONTAINER}
        initial={reduced ? undefined : 'hidden'}
        animate={reduced ? undefined : 'show'}
      >
        {ACTIONS.map((action, i) => (
          <ActionCard key={action.href} action={action} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
