import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import {
  Plane,
  ArrowRight,
  Sparkles,
  MapPin,
  BarChart3,
  FileText,
  BookOpen,
  Cloud,
  Users,
  Wallet,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { APP_NAME } from '@/utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureDef {
  icon: ReactNode;
  title: string;
  desc: string;
  cls: string;
  wide?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: FeatureDef[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI Concierge',
    desc: '8 intelligent modules — morning brief, budget advisor, itinerary optimizer, packing assistant, food guide, safety advisor, AI journal, and live chat. All routed securely through a Supabase Edge Function.',
    cls: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400',
    wide: true,
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Trip Management',
    desc: 'Day-by-day itinerary builder with drag-and-drop reordering and real-time collaboration.',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Expense Tracking',
    desc: '9 categories, 30+ live exchange rates, per-category budget alerts.',
    cls: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Analytics',
    desc: '6 chart types, 8 KPI cards, and cross-trip spend insights powered by Recharts.',
    cls: 'bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400',
    wide: true,
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Travel Journal',
    desc: 'Mood-based entries, photo uploads, and AI narrative generation.',
    cls: 'bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400',
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: 'Weather & Nearby',
    desc: '7-day forecasts via Open-Meteo and Geoapify-powered nearby place search.',
    cls: 'bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Document Vault',
    desc: 'Passport and travel doc storage with expiry tracking and AI health overview.',
    cls: 'bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Collaboration',
    desc: 'Role-based access — owner, editor, viewer — with real-time activity feeds.',
    cls: 'bg-teal-500/10 text-teal-500 dark:bg-teal-400/10 dark:text-teal-400',
  },
];

const STATS = [
  { n: 8, suffix: '+', label: 'AI modules' },
  { n: 30, suffix: '+', label: 'Currencies' },
  { n: 13, suffix: '+', label: 'Feature modules' },
  { n: 100, suffix: '%', label: 'TypeScript strict' },
];

const TECH_PILLS = [
  { label: 'React 18', color: '#61DAFB' },
  { label: 'TypeScript 5', color: '#3178C6' },
  { label: 'Supabase', color: '#3ECF8E' },
  { label: 'Tailwind CSS', color: '#06B6D4' },
  { label: 'Framer Motion', color: '#FF4D4D' },
  { label: 'PWA', color: '#8B5CF6' },
];

// ─── Variants ─────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 22, stiffness: 75, delay: (i ?? 0) * 0.07 },
  }),
};

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// ─── ParticleCanvas ───────────────────────────────────────────────────────────

function ParticleCanvas({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 48;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.1 + 0.4,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 120) * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = 'rgba(99,102,241,0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-55 dark:opacity-35"
    />
  );
}

// ─── MockupStack ──────────────────────────────────────────────────────────────

function MockupStack({ reduced }: { reduced: boolean }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sp = { damping: 28, stiffness: 190 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), sp);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), sp);

  const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) / r.width);
    my.set((e.clientY - r.top - r.height / 2) / r.height);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const float1 = reduced ? {} : { y: [0, -12, 0] };
  const float2 = reduced ? {} : { y: [0, -8, 0] };
  const float3 = reduced ? {} : { y: [0, -10, 0] };

  return (
    <div
      className="relative flex h-[540px] items-start justify-center"
      style={{ perspective: '1100px' }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={reduced ? {} : { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        className="relative w-[292px]"
      >
        {/* ── Card 1: AI Concierge ─────────────────────────────────────────── */}
        <motion.div
          animate={float1}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(80px)', position: 'relative', zIndex: 3 }}
          className="rounded-[20px] border border-black/[0.06] bg-white/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-slate-900/95"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              AI Concierge
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Good morning! Tokyo is 23°C today. Your ¥350k budget is on track — 78% remaining with 6
            days left.
          </div>
          <div className="mt-3 flex gap-1.5">
            {['Budget', 'Plan', 'Explore'].map((t) => (
              <span
                key={t}
                className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Card 2: Trip Overview ────────────────────────────────────────── */}
        <motion.div
          animate={float2}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            transform: 'translateZ(20px) translateX(-30px)',
            position: 'absolute',
            top: 118,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
          className="rounded-[20px] border border-black/[0.06] bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.13)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/95"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Trip
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              Active
            </span>
          </div>
          <div className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
            Tokyo Adventure
          </div>
          <div className="mb-4 mt-1 text-[12px] text-slate-400">Mar 12 – Mar 25 · Japan</div>
          <div className="mb-1.5 flex justify-between text-[11px] text-slate-500">
            <span>Budget</span>
            <span className="font-semibold">¥280k / ¥350k</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </motion.div>

        {/* ── Card 3: Expenses ─────────────────────────────────────────────── */}
        <motion.div
          animate={float3}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            transform: 'translateZ(-28px) translateX(26px)',
            position: 'absolute',
            top: 250,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
          className="bg-white/88 dark:bg-slate-900/88 rounded-[20px] border border-black/[0.05] p-5 shadow-[0_8px_28px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-white/[0.06]"
        >
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            March Spend
          </div>
          <div className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">
            $2,847
          </div>
          <div className="mb-4 text-[12px] text-slate-400">of $4,000 budget · 71%</div>
          <div className="flex items-end gap-1.5">
            {[40, 72, 55, 88, 62, 95, 70, 84].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h * 0.3}px`,
                  background:
                    i % 2 === 0
                      ? 'rgba(99,102,241,0.22)'
                      : 'linear-gradient(to top, #6366F1, #8B5CF6)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── FeaturesGrid ─────────────────────────────────────────────────────────────

function FeaturesGrid({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      variants={reduced ? {} : staggerParent}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          custom={i}
          variants={reduced ? {} : fadeUp}
          className={[
            'group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6',
            'transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-[0_12px_36px_rgba(99,102,241,0.12)]',
            'dark:border-slate-700/50 dark:bg-slate-900 dark:hover:border-indigo-700/40',
            f.wide ? 'col-span-2' : '',
          ].join(' ')}
        >
          {f.wide && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/[0.04] blur-3xl transition-all duration-500 group-hover:bg-indigo-500/[0.08]"
            />
          )}
          <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.cls}`}>{f.icon}</div>
          <h3 className="mb-2 text-[15px] font-semibold text-slate-900 dark:text-white">
            {f.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── StatsRow ─────────────────────────────────────────────────────────────────

function StatsRow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    if (!inView) return;
    const DUR = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DUR, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounts(STATS.map(({ n }) => Math.round(ease * n)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 dark:border-slate-700/50 dark:bg-slate-700/50 md:grid-cols-4"
    >
      {STATS.map(({ suffix, label }, i) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 bg-white px-6 py-9 dark:bg-slate-900"
        >
          <span className="bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-4xl font-black tabular-nums text-transparent">
            {counts[i]}
            {suffix}
          </span>
          <span className="text-[13px] text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LandingNav ───────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-[#07070E]/80'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <Plane className="h-4 w-4" />
          </div>
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {(
            [
              ['#features', 'Features'],
              ['#stats', 'Built with'],
              ['#cta', 'Get started'],
            ] as [string, string][]
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── LandingPage ──────────────────────────────────────────────────────────────

function LandingPage({ reduced }: { reduced: boolean }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#07070E] dark:text-white">
      <LandingNav />

      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden px-5 pb-20 pt-24">
        {/* Orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/4 h-[640px] w-[640px] rounded-full bg-indigo-500/[0.08] blur-[130px] dark:bg-indigo-500/[0.12]" />
          <div className="absolute right-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-[110px] dark:bg-violet-500/[0.1]" />
          <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-500/[0.05] blur-[90px]" />
        </div>
        <ParticleCanvas reduced={reduced} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          {/* Left col */}
          <motion.div variants={reduced ? {} : staggerParent} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div custom={0} variants={reduced ? {} : fadeUp}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3.5 py-1.5 text-[13px] font-medium text-indigo-600 backdrop-blur dark:border-indigo-500/20 dark:bg-indigo-500/[0.06] dark:text-indigo-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                v2.0.0 · Production Ready
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={reduced ? {} : fadeUp}
              className="mb-5 text-5xl font-black leading-[1.06] tracking-[-0.03em] lg:text-[62px]"
            >
              Travel smarter
              <br />
              with{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                AI at your side
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              custom={2}
              variants={reduced ? {} : fadeUp}
              className="mb-8 max-w-[480px] text-[17px] leading-relaxed text-slate-500 dark:text-slate-400"
            >
              Plan trips, track expenses, manage documents, and get AI-powered insights — all in one
              beautifully crafted app built with React 18 and Supabase.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={reduced ? {} : fadeUp}
              className="mb-8 flex flex-wrap gap-3"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/esaipavan/TravelMate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-[15px] font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                <Star className="h-4 w-4" />
                Star on GitHub
              </a>
            </motion.div>

            {/* Tech pills */}
            <motion.div
              custom={4}
              variants={reduced ? {} : fadeUp}
              className="flex flex-wrap gap-2"
            >
              {TECH_PILLS.map(({ label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[12px] font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-400"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right col — 3D cards */}
          <div className="hidden lg:block">
            <MockupStack reduced={reduced} />
          </div>
        </div>

        {/* Scroll cue */}
        {!reduced && (
          <motion.div
            animate={{ y: [0, 9, 0], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5"
            aria-hidden="true"
          >
            <div className="h-9 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600">
              <div className="mx-auto mt-1.5 h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════ FEATURES ══════════════════════════════ */}
      <section id="features" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block text-[12px] font-bold uppercase tracking-[0.1em] text-indigo-500">
              Features
            </span>
            <h2 className="text-4xl font-black tracking-[-0.03em] dark:text-white">
              Everything for modern travel
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-slate-500 dark:text-slate-400">
              13+ modules built for the way real travelers think, plan, and explore.
            </p>
          </div>
          <FeaturesGrid reduced={reduced} />
        </div>
      </section>

      {/* ════════════════════════════════ STATS ═══════════════════════════════ */}
      <section id="stats" className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <StatsRow />
        </div>
      </section>

      {/* ════════════════════════════════  CTA  ═══════════════════════════════ */}
      <section id="cta" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-8 py-20 text-center shadow-2xl shadow-indigo-500/20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 right-1/4 h-72 w-72 rounded-full bg-violet-900/30 blur-3xl"
            />
            <div className="relative">
              <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-indigo-200">
                Open source · Free to use
              </div>
              <h2 className="mb-3 text-4xl font-black tracking-[-0.03em] text-white">
                Ready to travel smarter?
              </h2>
              <p className="mx-auto mb-9 max-w-md text-[16px] text-indigo-100">
                TravelMate v2.0 is live, open source, and completely free to explore.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-indigo-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 text-[15px] font-medium text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ════════════════════════════════ */}
      <footer className="border-t border-slate-200/60 px-5 py-8 dark:border-slate-800/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Plane className="h-3 w-3 text-white" />
            </div>
            {APP_NAME}
            <span className="text-slate-400 dark:text-slate-600">v2.0.0</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['React 18', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'].map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 dark:border-slate-700 dark:text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-slate-400 dark:text-slate-600">By Sai Pavan Etikala</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Default export — auth gate ───────────────────────────────────────────────

export default function SplashPage() {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (isLoading || !user) return;
    navigate('/dashboard', { replace: true });
  }, [user, isLoading, navigate]);

  if (isLoading) return <PageLoader />;
  if (user) return null;

  return <LandingPage reduced={reduced} />;
}
