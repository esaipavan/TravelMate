import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
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
  accent: string;
  wide?: boolean;
}

interface GlobeArc {
  from: number;
  to: number;
  p: number;
  speed: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: FeatureDef[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI Concierge',
    desc: '8 intelligent modules — morning brief, budget advisor, itinerary optimizer, packing assistant, food guide, safety advisor, AI journal, and live chat. All routed through a Supabase Edge Function. Zero client-side API keys.',
    accent: 'rgba(99,102,241,0.8)',
    wide: true,
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Trip Management',
    desc: 'Day-by-day itinerary builder with drag-and-drop reordering and real-time collaboration.',
    accent: 'rgba(16,185,129,0.8)',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Expense Tracking',
    desc: '9 categories, 30+ live exchange rates, per-category budget alerts.',
    accent: 'rgba(245,158,11,0.8)',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Analytics',
    desc: '6 chart types, 8 KPI cards, and cross-trip spend insights powered by Recharts.',
    accent: 'rgba(14,165,233,0.8)',
    wide: true,
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Travel Journal',
    desc: 'Mood-based entries, photo uploads, and AI narrative generation.',
    accent: 'rgba(244,63,94,0.8)',
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: 'Weather & Nearby',
    desc: '7-day forecasts via Open-Meteo and Geoapify-powered nearby place search.',
    accent: 'rgba(139,92,246,0.8)',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Document Vault',
    desc: 'Passport and travel doc storage with expiry tracking and AI health overview.',
    accent: 'rgba(249,115,22,0.8)',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Collaboration',
    desc: 'Role-based access — owner, editor, viewer — with real-time activity feeds.',
    accent: 'rgba(20,184,166,0.8)',
  },
];

const STATS = [
  { n: 8, suffix: '+', label: 'AI modules' },
  { n: 30, suffix: '+', label: 'Currencies' },
  { n: 13, suffix: '+', label: 'Feature modules' },
  { n: 100, suffix: '%', label: 'TypeScript strict' },
];

const MARQUEE_ITEMS = [
  'AI Concierge',
  '✦',
  'Trip Planning',
  '✦',
  'Expense Tracking',
  '✦',
  'Travel Journal',
  '✦',
  'Analytics',
  '✦',
  'Weather Insights',
  '✦',
  'Document Vault',
  '✦',
  'Collaboration',
  '✦',
  'PWA Ready',
  '✦',
  'Supabase Powered',
  '✦',
  'TypeScript Strict',
];

// Globe city coords [lat, lon]
const CITIES: [number, number][] = [
  [35.68, 139.69], // Tokyo
  [48.86, 2.35], // Paris
  [40.71, -74.01], // New York
  [25.2, 55.27], // Dubai
  [-33.87, 151.21], // Sydney
  [51.51, -0.13], // London
  [-8.34, 115.09], // Bali
  [41.9, 12.5], // Rome
  [-22.9, -43.17], // Rio
  [13.75, 100.52], // Bangkok
  [1.35, 103.82], // Singapore
  [55.75, 37.62], // Moscow
];

// ─── Variants ─────────────────────────────────────────────────────────────────

const blurUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(10px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 20, stiffness: 60, delay: (i ?? 0) * 0.1 },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── Globe ────────────────────────────────────────────────────────────────────

function Globe({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = canvas.offsetWidth;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = SIZE * 0.41;

    let rotY = 0.4;

    const arcs: GlobeArc[] = [
      { from: 0, to: 1, p: 0.1, speed: 0.0035 },
      { from: 2, to: 5, p: 0.45, speed: 0.0028 },
      { from: 3, to: 4, p: 0.7, speed: 0.0032 },
      { from: 6, to: 7, p: 0.2, speed: 0.0045 },
      { from: 9, to: 10, p: 0.6, speed: 0.004 },
      { from: 1, to: 8, p: 0.85, speed: 0.003 },
    ];

    function project(lat: number, lon: number) {
      const phi = (lat * Math.PI) / 180;
      const theta = (lon * Math.PI) / 180 + rotY;
      const x3 = Math.cos(phi) * Math.cos(theta);
      const y3 = Math.sin(phi);
      const z3 = Math.cos(phi) * Math.sin(theta);
      return { x: cx + x3 * R, y: cy - y3 * R, z: z3 };
    }

    function gcPoint(lat1: number, lon1: number, lat2: number, lon2: number, t: number) {
      const toR = (d: number) => (d * Math.PI) / 180;
      const p1 = toR(lat1);
      const t1 = toR(lon1);
      const p2 = toR(lat2);
      const t2 = toR(lon2);
      const ax = Math.cos(p1) * Math.cos(t1);
      const ay = Math.sin(p1);
      const az = Math.cos(p1) * Math.sin(t1);
      const bx = Math.cos(p2) * Math.cos(t2);
      const by = Math.sin(p2);
      const bz = Math.cos(p2) * Math.sin(t2);
      const nx = ax + (bx - ax) * t;
      const ny = ay + (by - ay) * t;
      const nz = az + (bz - az) * t;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      return {
        lat: (Math.asin(ny / len) * 180) / Math.PI,
        lon: (Math.atan2(nz / len, nx / len) * 180) / Math.PI,
      };
    }

    let raf = 0;
    const tick = (time: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Atmosphere glow
      const atm = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R * 1.22);
      atm.addColorStop(0, 'rgba(99,102,241,0)');
      atm.addColorStop(0.65, 'rgba(99,102,241,0.06)');
      atm.addColorStop(1, 'rgba(139,92,246,0.18)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // Latitude grid
      for (let lat = -75; lat <= 75; lat += 15) {
        let prev: { x: number; y: number; z: number } | null = null;
        for (let lon = 0; lon <= 360; lon += 4) {
          const p = project(lat, lon);
          if (prev && Math.abs(lon - 4) % 360 < 180) {
            const a = Math.max(0, (p.z + (prev?.z ?? 0)) / 2) * 0.18 + 0.04;
            ctx.strokeStyle = `rgba(99,102,241,${a})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
          prev = p;
        }
      }

      // Longitude grid
      for (let lon = 0; lon < 360; lon += 18) {
        for (let lat = -87; lat < 87; lat += 4) {
          const p1 = project(lat, lon);
          const p2 = project(lat + 4, lon);
          const a = Math.max(0, (p1.z + p2.z) / 2) * 0.18 + 0.04;
          ctx.strokeStyle = `rgba(99,102,241,${a})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Flight arcs
      for (const arc of arcs) {
        arc.p = (arc.p + arc.speed) % 1;
        const [lat1, lon1] = CITIES[arc.from];
        const [lat2, lon2] = CITIES[arc.to];
        const TRAIL = 0.25;
        const STEPS = 28;

        for (let i = 0; i < STEPS; i++) {
          const t0 = Math.max(0, arc.p - TRAIL + (i / STEPS) * TRAIL);
          const t1 = Math.max(0, arc.p - TRAIL + ((i + 1) / STEPS) * TRAIL);
          const g0 = gcPoint(lat1, lon1, lat2, lon2, t0);
          const g1 = gcPoint(lat1, lon1, lat2, lon2, t1);
          const pa = project(g0.lat, g0.lon);
          const pb = project(g1.lat, g1.lon);
          if (pa.z > 0.05 && pb.z > 0.05) {
            const head = i / STEPS;
            const alpha = head * 0.85 * Math.max(0, pa.z);
            const r = 99 + Math.round(40 * head);
            const g = 102 - Math.round(10 * head);
            const b = 241 + Math.round(14 * head);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = head * 2.2 + 0.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }

        // Head comet
        const hpt = gcPoint(lat1, lon1, lat2, lon2, arc.p);
        const hp = project(hpt.lat, hpt.lon);
        if (hp.z > 0.1) {
          const hg = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 9);
          hg.addColorStop(0, `rgba(196,181,253,${hp.z * 0.95})`);
          hg.addColorStop(1, 'rgba(139,92,246,0)');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${hp.z * 0.9})`;
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Destination markers
      const pulse = 0.55 + 0.45 * Math.sin(time * 0.002);
      for (let i = 0; i < CITIES.length; i++) {
        const [lat, lon] = CITIES[i];
        const p = project(lat, lon);
        if (p.z < 0.08) continue;
        const beat = 0.5 + 0.5 * Math.sin(time * 0.0018 + i * 1.1);
        const alpha = p.z * 0.95;

        // Ring pulse
        ctx.strokeStyle = `rgba(165,180,252,${alpha * beat * 0.5 * pulse})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 + beat * 4, 0, Math.PI * 2);
        ctx.stroke();

        // Glow
        const dg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
        dg.addColorStop(0, `rgba(129,140,248,${alpha * 0.75})`);
        dg.addColorStop(1, 'rgba(129,140,248,0)');
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(224,231,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Limb glow (edge of sphere)
      const limb = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      limb.addColorStop(0, 'rgba(99,102,241,0)');
      limb.addColorStop(1, 'rgba(99,102,241,0.14)');
      ctx.fillStyle = limb;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      rotY += 0.0022;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none h-full w-full" />;
}

// ─── CursorGlow ───────────────────────────────────────────────────────────────

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.background = `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(99,102,241,0.09), transparent 40%)`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 hidden transition-all duration-75 lg:block"
    />
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

function Marquee({ reduced }: { reduced: boolean }) {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={reduced ? {} : { x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/25"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── MagneticButton ───────────────────────────────────────────────────────────

function MagneticButton({
  children,
  className,
  style,
  to,
  reduced,
}: {
  children: ReactNode;
  className: string;
  style?: CSSProperties;
  to: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22 });
  const sy = useSpring(y, { stiffness: 320, damping: 22 });

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={reduced ? {} : { x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    </motion.div>
  );
}

// ─── LandingNav ───────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-white/[0.07] bg-[#06060F]/75 backdrop-blur-2xl'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40">
            <Plane className="h-4 w-4 text-white" />
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
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-indigo-500/50 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── StatsRow ─────────────────────────────────────────────────────────────────

function StatsRow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    if (!inView) return;
    const DUR = 1500;
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
    <div ref={ref} className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {STATS.map(({ suffix, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
          className="text-center"
        >
          <div
            className="mb-1 text-5xl font-black tabular-nums leading-none"
            style={{
              background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {counts[i]}
            {suffix}
          </div>
          <div className="text-[13px] font-medium text-white/40">{label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────

function FeatureCard({ f, i, reduced }: { f: FeatureDef; i: number; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) / r.width);
    my.set((e.clientY - r.top - r.height / 2) / r.height);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      custom={i}
      variants={reduced ? {} : blurUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduced ? {} : { rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      className={[
        'group relative overflow-hidden rounded-2xl p-px transition-all duration-300',
        f.wide ? 'col-span-2' : '',
      ].join(' ')}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${f.accent}, rgba(139,92,246,0.3), rgba(255,255,255,0.04))`,
        }}
      />
      <div
        className="absolute inset-[1px] rounded-[14px]"
        style={{ background: 'rgba(10,10,20,0.95)' }}
      />

      {/* Static border */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {f.wide && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: f.accent }}
          />
        )}
        <div
          className="mb-4 inline-flex rounded-xl p-2.5"
          style={{ background: `${f.accent.replace('0.8', '0.12')}` }}
        >
          <span style={{ color: f.accent.replace('0.8', '1') }}>{f.icon}</span>
        </div>
        <h3 className="mb-2 text-[15px] font-semibold text-white">{f.title}</h3>
        <p className="text-[13px] leading-relaxed text-white/45">{f.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── LandingPage ──────────────────────────────────────────────────────────────

function LandingPage({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="dark min-h-screen overflow-x-hidden"
      style={{ background: '#06060F', color: '#F8FAFC' }}
    >
      <CursorGlow />
      <LandingNav />

      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-8 pt-20">
        {/* Deep space background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            }}
          />
          {/* Star field */}
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                width: i % 4 === 0 ? 2 : 1,
                height: i % 4 === 0 ? 2 : 1,
                opacity: 0.08 + (i % 5) * 0.06,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Left — text */}
          <motion.div variants={reduced ? {} : stagger} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div custom={0} variants={reduced ? {} : blurUp}>
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a5b4fc',
                }}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                v2.0.0 · Production Ready
              </div>
            </motion.div>

            {/* Headline — word by word */}
            <h1 className="mb-6 text-5xl font-black leading-[1.06] tracking-[-0.04em] lg:text-[68px]">
              {['Travel', 'smarter'].map((w, i) => (
                <motion.span
                  key={w}
                  custom={i + 1}
                  variants={reduced ? {} : blurUp}
                  className="mr-4 inline-block"
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                custom={3}
                variants={reduced ? {} : blurUp}
                className="mr-3 inline-block text-white/40"
              >
                with
              </motion.span>
              <motion.span
                custom={4}
                variants={reduced ? {} : blurUp}
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI at your side
              </motion.span>
            </h1>

            {/* Sub */}
            <motion.p
              custom={5}
              variants={reduced ? {} : blurUp}
              className="mb-9 max-w-[480px] text-[17px] leading-relaxed"
              style={{ color: 'rgba(248,250,252,0.48)' }}
            >
              Plan trips, track expenses, manage documents, and get AI-powered insights — all in one
              beautifully crafted app built with React 18 and Supabase.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={6}
              variants={reduced ? {} : blurUp}
              className="mb-9 flex flex-wrap gap-3"
            >
              <MagneticButton
                to="/register"
                reduced={reduced}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <a
                href="https://github.com/esaipavan/TravelMate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-medium transition-all hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(248,250,252,0.7)',
                }}
              >
                <Star className="h-4 w-4" />
                Star on GitHub
              </a>
            </motion.div>

            {/* Pills */}
            <motion.div
              custom={7}
              variants={reduced ? {} : blurUp}
              className="flex flex-wrap gap-2"
            >
              {[
                { label: 'React 18', c: '#61DAFB' },
                { label: 'TypeScript 5', c: '#3178C6' },
                { label: 'Supabase', c: '#3ECF8E' },
                { label: 'Tailwind CSS', c: '#06B6D4' },
                { label: 'Framer Motion', c: '#FF4D4D' },
                { label: 'PWA', c: '#8B5CF6' },
              ].map(({ label, c }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(248,250,252,0.55)',
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Globe */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Glow behind globe */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 72%)',
                filter: 'blur(40px)',
              }}
            />
            <div className="relative h-[480px] w-[480px]">
              <Globe reduced={reduced} />
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        {!reduced && (
          <motion.div
            animate={{ y: [0, 9, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            aria-hidden="true"
          >
            <div
              className="h-9 w-5 rounded-full"
              style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}
            >
              <div
                className="mx-auto mt-1.5 h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ background: 'rgba(165,180,252,0.6)' }}
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════ MARQUEE ══════════════════════════════ */}
      <Marquee reduced={reduced} />

      {/* ══════════════════════════════ FEATURES ══════════════════════════════ */}
      <section id="features" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <span
                className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: '#818cf8' }}
              >
                Features
              </span>
              <h2 className="text-[38px] font-black tracking-[-0.03em] text-white">
                Everything for modern travel
              </h2>
              <p
                className="mx-auto mt-3 max-w-md text-[15px]"
                style={{ color: 'rgba(248,250,252,0.4)' }}
              >
                13+ modules built for the way real travelers think, plan, and explore.
              </p>
            </motion.div>
          </div>

          <div
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: '1000px' }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} i={i} reduced={reduced} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ STATS ═══════════════════════════════ */}
      <section id="stats" className="px-5 py-20">
        <div
          className="mx-auto max-w-5xl rounded-3xl px-8 py-16"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="mb-12 text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              By the numbers
            </p>
          </div>
          <StatsRow />
        </div>
      </section>

      {/* ════════════════════════════════  CTA  ═══════════════════════════════ */}
      <section id="cta" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-20 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(79,70,229,0.25) 0%, rgba(109,40,217,0.2) 50%, rgba(99,102,241,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(99,102,241,0.18), transparent)',
              }}
            />
            <div className="relative">
              <p
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: '#a5b4fc' }}
              >
                Open source · Free to use
              </p>
              <h2 className="mb-3 text-4xl font-black tracking-[-0.03em] text-white">
                Ready to travel smarter?
              </h2>
              <p
                className="mx-auto mb-9 max-w-md text-[16px]"
                style={{ color: 'rgba(248,250,252,0.5)' }}
              >
                TravelMate v2.0 is live, open source, and completely free to explore.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                  }}
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-medium text-white/70 transition-all hover:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-semibold text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Plane className="h-3 w-3 text-white" />
            </div>
            {APP_NAME}
            <span style={{ color: 'rgba(248,250,252,0.2)' }}>v2.0.0</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['React 18', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'].map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(248,250,252,0.25)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[13px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
            By Sai Pavan Etikala
          </p>
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
