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
  UserPlus,
  ChevronDown,
  Github,
  Check,
  Smartphone,
  Shield,
  Zap,
  Globe2,
  Lock,
  Eye,
  Server,
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
    desc: '8 intelligent modules — morning brief, budget advisor, itinerary optimizer, packing assistant, food guide, safety advisor, AI journal, and live chat. Zero client-side API keys.',
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

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <UserPlus className="h-6 w-6" />,
    title: 'Create your account',
    desc: 'Sign up in seconds with email or Google. No credit card, no trial period — free forever.',
    accent: 'rgba(99,102,241,0.8)',
  },
  {
    step: '02',
    icon: <MapPin className="h-6 w-6" />,
    title: 'Add your first trip',
    desc: 'Name your destination, set your dates, and invite your travel companions. Everything syncs in real time.',
    accent: 'rgba(16,185,129,0.8)',
  },
  {
    step: '03',
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Plan with AI at your side',
    desc: 'Let the AI Concierge optimise your itinerary, suggest packing lists, forecast your budget, and give local insights.',
    accent: 'rgba(139,92,246,0.8)',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: 'Is TravelMate really free?',
    a: 'Yes — completely free, forever. TravelMate is open source and has no premium tier. All 13+ modules, the AI Concierge, and real-time collaboration are included at no cost.',
  },
  {
    q: 'What AI models power the concierge?',
    a: 'TravelMate routes all AI requests through a Supabase Edge Function and supports Groq (Llama 3.3), Google Gemini, and OpenRouter. Zero API keys are ever exposed in the browser.',
  },
  {
    q: 'Does it work offline?',
    a: "Yes. TravelMate is a Progressive Web App (PWA) with a Workbox service worker that caches assets and your most recent trip data. You can install it on your phone's home screen and use core features without an internet connection.",
  },
  {
    q: 'Is my travel data secure?',
    a: 'All data is stored in Supabase with Row-Level Security (RLS) enforced at the database level — you can only ever read or modify your own trips. Storage buckets for documents and photos enforce the same policy.',
  },
  {
    q: 'Can I collaborate with other travellers?',
    a: 'Absolutely. Invite anyone to a trip with owner, editor, or viewer roles. Changes appear in real time via Supabase Realtime, and an activity feed tracks who did what.',
  },
  {
    q: 'Which currencies are supported?',
    a: 'TravelMate tracks 30+ currencies with live rates via the Frankfurter API (updated daily). You can log expenses in any currency and view your budget converted to your home currency.',
  },
  {
    q: 'Can I export my trip data?',
    a: 'Yes. The Export module generates a PDF of your full itinerary, budget summary, and expense log using @react-pdf/renderer — ready to share or print before you travel.',
  },
  {
    q: 'How do I install it on my phone?',
    a: 'Open TravelMate in Chrome or Safari on your phone, then tap the browser menu and select "Add to Home Screen". The app installs instantly with a native-app experience and offline support.',
  },
] as const;

// Testimonials removed — will be replaced with real user quotes after launch

// Globe city coords [lat, lon]
const CITIES: [number, number][] = [
  [35.68, 139.69],
  [48.86, 2.35],
  [40.71, -74.01],
  [25.2, 55.27],
  [-33.87, 151.21],
  [51.51, -0.13],
  [-8.34, 115.09],
  [41.9, 12.5],
  [-22.9, -43.17],
  [13.75, 100.52],
  [1.35, 103.82],
  [55.75, 37.62],
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

      const atm = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R * 1.22);
      atm.addColorStop(0, 'rgba(99,102,241,0)');
      atm.addColorStop(0.65, 'rgba(99,102,241,0.06)');
      atm.addColorStop(1, 'rgba(139,92,246,0.18)');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

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

      const pulse = 0.55 + 0.45 * Math.sin(time * 0.002);
      for (let i = 0; i < CITIES.length; i++) {
        const [lat, lon] = CITIES[i];
        const p = project(lat, lon);
        if (p.z < 0.08) continue;
        const beat = 0.5 + 0.5 * Math.sin(time * 0.0018 + i * 1.1);
        const alpha = p.z * 0.95;

        ctx.strokeStyle = `rgba(165,180,252,${alpha * beat * 0.5 * pulse})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 + beat * 4, 0, Math.PI * 2);
        ctx.stroke();

        const dg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
        dg.addColorStop(0, `rgba(129,140,248,${alpha * 0.75})`);
        dg.addColorStop(1, 'rgba(129,140,248,0)');
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(224,231,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

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

function LandingNav({
  showBanner: _showBanner,
  onDismissBanner: _onDismissBanner,
}: {
  showBanner: boolean;
  onDismissBanner: () => void;
}) {
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
          ? 'border-b border-white/[0.07] bg-[#06060F]/80 backdrop-blur-2xl'
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

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {(
            [
              ['#features', 'Features'],
              ['#how-it-works', 'How it works'],
              ['#faq', 'FAQ'],
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
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}
      />
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

// ─── HowItWorks ───────────────────────────────────────────────────────────────

function HowItWorks({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div ref={ref} className="mb-14 text-center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', damping: 20 }}
          >
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              How it works
            </span>
            <h2 className="text-[38px] font-black tracking-[-0.03em] text-white">
              Up and running in minutes
            </h2>
            <p
              className="mx-auto mt-3 max-w-md text-[15px]"
              style={{ color: 'rgba(248,250,252,0.4)' }}
            >
              No complex setup. Just sign up, create a trip, and let the AI do the heavy lifting.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[52px] hidden h-px w-2/3 -translate-x-1/2 lg:block"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 20%, rgba(99,102,241,0.3) 80%, transparent)',
            }}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={reduced ? {} : { opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, type: 'spring', damping: 22, stiffness: 80 }}
                className="relative flex flex-col items-center gap-5 rounded-2xl p-7 text-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Step number badge */}
                <div
                  className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl"
                  style={{
                    background: `${step.accent.replace('0.8', '0.12')}`,
                    border: `1px solid ${step.accent.replace('0.8', '0.25')}`,
                  }}
                >
                  <span style={{ color: step.accent.replace('0.8', '1') }}>{step.icon}</span>
                  <span
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                    style={{ background: 'rgba(99,102,241,0.9)' }}
                  >
                    {i + 1}
                  </span>
                </div>

                <div>
                  <h3 className="mb-2 text-[16px] font-bold text-white">{step.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/45">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            { icon: <Shield className="h-3.5 w-3.5" />, label: 'Supabase RLS security' },
            { icon: <Zap className="h-3.5 w-3.5" />, label: 'PWA — works offline' },
            { icon: <Globe2 className="h-3.5 w-3.5" />, label: '30+ currencies' },
            { icon: <Smartphone className="h-3.5 w-3.5" />, label: 'Install on any device' },
            { icon: <Github className="h-3.5 w-3.5" />, label: 'Open source on GitHub' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-[12px] font-medium"
              style={{ color: 'rgba(248,250,252,0.35)' }}
            >
              <span style={{ color: '#818cf8' }}>{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── ProductShowcase ──────────────────────────────────────────────────────────

const SHOWCASE_TABS = [
  {
    label: 'Dashboard',
    accent: '#6366f1',
    content: {
      heading: 'Your travel command centre',
      desc: 'See all upcoming trips, live weather, AI-generated insights, and budget health at a glance.',
      mockup: 'dashboard',
    },
  },
  {
    label: 'AI Concierge',
    accent: '#8b5cf6',
    content: {
      heading: 'AI that thinks like a travel expert',
      desc: 'Ask anything. Get itinerary suggestions, packing lists, safety briefings, and local food tips — powered by Groq, Gemini, or OpenRouter.',
      mockup: 'ai',
    },
  },
  {
    label: 'Expenses',
    accent: '#f59e0b',
    content: {
      heading: 'Never go over budget again',
      desc: 'Log expenses in any currency, view live conversion rates, and get category-level alerts before you overspend.',
      mockup: 'expenses',
    },
  },
  {
    label: 'Itinerary',
    accent: '#10b981',
    content: {
      heading: 'Build perfect day-by-day plans',
      desc: 'Drag-and-drop activities, set reminders, invite collaborators, and export a polished PDF — all without leaving the app.',
      mockup: 'itinerary',
    },
  },
] as const;

function DashboardMockup() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-white/10" />
          <div className="h-3 w-3 rounded-full bg-white/10" />
        </div>
      </div>
      {/* Trip cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Tokyo', status: 'Upcoming', color: '#6366f1' },
          { label: 'Bali', status: 'Planning', color: '#10b981' },
        ].map(({ label, status, color }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="mb-1.5 h-2 w-8 rounded-full" style={{ background: color + '60' }} />
            <div className="mb-0.5 text-[11px] font-bold text-white">{label}</div>
            <div className="text-[9px]" style={{ color }}>
              {status}
            </div>
          </div>
        ))}
      </div>
      {/* Weather widget */}
      <div
        className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mb-1 text-[9px] uppercase tracking-widest text-white/30">
          Weather · Tokyo
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[20px] font-black text-white">24°C</div>
          <div className="flex gap-1">
            {[16, 20, 18, 22, 19].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-2 rounded-full"
                  style={{ height: `${t / 2}px`, background: 'rgba(99,102,241,0.5)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* AI insights row */}
      <div className="flex gap-2">
        {['Budget on track', 'Flight in 3 days'].map((tip) => (
          <div
            key={tip}
            className="flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-[9px] text-indigo-300">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMockup() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="mb-1 text-[9px] uppercase tracking-widest text-white/30">AI Concierge</div>
      {/* Chat messages */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-end">
          <div
            className="max-w-[70%] rounded-2xl rounded-tr-sm px-3 py-2 text-[10px] text-white"
            style={{ background: 'rgba(99,102,241,0.6)' }}
          >
            Best street food in Tokyo?
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]"
            style={{ background: 'rgba(139,92,246,0.3)' }}
          >
            <Sparkles className="h-3 w-3 text-violet-300" aria-hidden="true" />
          </div>
          <div
            className="rounded-2xl rounded-tl-sm px-3 py-2 text-[10px] text-white/70"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            Try Tsukiji Outer Market for fresh sushi, Shibuya for ramen, and Harajuku crêpes…
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="max-w-[70%] rounded-2xl rounded-tr-sm px-3 py-2 text-[10px] text-white"
            style={{ background: 'rgba(99,102,241,0.6)' }}
          >
            Add these to my itinerary
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(139,92,246,0.3)' }}
          >
            <Sparkles className="h-3 w-3 text-violet-300" aria-hidden="true" />
          </div>
          <div
            className="rounded-2xl rounded-tl-sm px-3 py-2 text-[10px]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-1.5 text-white/70">
              <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />3 items added to Day
              2 itinerary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpensesMockup() {
  const cats = [
    { label: 'Hotels', pct: 42, color: '#f59e0b' },
    { label: 'Food', pct: 26, color: '#10b981' },
    { label: 'Transport', pct: 18, color: '#6366f1' },
    { label: 'Activities', pct: 14, color: '#f43f5e' },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="text-[9px] uppercase tracking-widest text-white/30">Budget · Tokyo Trip</div>
      {/* Donut stand-in */}
      <div className="flex items-center gap-4">
        <div
          className="relative h-16 w-16 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(#f59e0b 0% 42%, #10b981 42% 68%, #6366f1 68% 86%, #f43f5e 86% 100%)`,
          }}
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{ background: 'rgba(10,10,20,0.95)' }}
          />
        </div>
        <div className="flex flex-col gap-1">
          {cats.map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-white/50">{label}</span>
              <span className="ml-auto text-[10px] font-semibold text-white/70">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent expenses */}
      <div className="flex flex-col gap-1.5">
        {[
          { name: 'Shinjuku Hotel', amt: '¥18,400', cat: 'Hotels' },
          { name: 'Ramen Ichiran', amt: '¥1,200', cat: 'Food' },
        ].map(({ name, amt, cat }) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div>
              <div className="text-[10px] font-medium text-white">{name}</div>
              <div className="text-[9px] text-white/30">{cat}</div>
            </div>
            <div className="text-[10px] font-semibold text-white/70">{amt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryMockup() {
  const days = [
    { day: 'Day 1', items: ['Arrive Narita', 'Shinjuku check-in', 'Omoide Yokocho dinner'] },
    { day: 'Day 2', items: ['Tsukiji Market', 'Harajuku crêpes', 'Shibuya crossing'] },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="text-[9px] uppercase tracking-widest text-white/30">Itinerary · Tokyo</div>
      {days.map(({ day, items }) => (
        <div key={day}>
          <div className="mb-1.5 text-[10px] font-bold text-white/60">{day}</div>
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: '#6366f1' }}
                />
                <span className="text-[10px] text-white/60">{item}</span>
                <div
                  className="ml-auto h-2 w-2 cursor-grab rounded-sm opacity-30"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductShowcase({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const tab = SHOWCASE_TABS[active];

  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div ref={ref} className="mb-12 text-center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', damping: 20 }}
          >
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              Product tour
            </span>
            <h2 className="text-[38px] font-black tracking-[-0.03em] text-white">
              See it in action
            </h2>
            <p
              className="mx-auto mt-3 max-w-md text-[15px]"
              style={{ color: 'rgba(248,250,252,0.4)' }}
            >
              Every module is purpose-built for the way real travellers think and plan.
            </p>
          </motion.div>
        </div>

        {/* Tab switcher */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {SHOWCASE_TABS.map(({ label, accent }, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              className="rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={
                active === i
                  ? {
                      background: accent + '22',
                      border: `1px solid ${accent}55`,
                      color: accent,
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)',
                    }
              }
              aria-pressed={active === i}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Showcase card */}
        <motion.div
          key={active}
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 100 }}
          className="grid gap-8 overflow-hidden rounded-3xl lg:grid-cols-[1fr_1.1fr]"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Text side */}
          <div className="flex flex-col justify-center gap-4 px-8 py-10">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: tab.accent }}
            >
              {tab.label}
            </div>
            <h3 className="text-[26px] font-bold leading-tight tracking-tight text-white">
              {tab.content.heading}
            </h3>
            <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
              {tab.content.desc}
            </p>
            <Link
              to="/register"
              className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: tab.accent }}
            >
              Try it free
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Mockup side — browser chrome */}
          <div
            className="relative overflow-hidden"
            style={{ background: 'rgba(6,6,15,0.7)', minHeight: '280px' }}
          >
            {/* Browser chrome bar */}
            <div
              className="flex items-center gap-1.5 px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              aria-hidden="true"
            >
              {['rgba(244,63,94,0.6)', 'rgba(245,158,11,0.6)', 'rgba(16,185,129,0.6)'].map((c) => (
                <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              ))}
              <div
                className="ml-2 h-4 flex-1 rounded-full text-center text-[8px] leading-4 text-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', maxWidth: '160px' }}
              >
                travelmate.vercel.app
              </div>
            </div>

            {/* Screen content */}
            <div className="h-[240px] overflow-hidden">
              {tab.content.mockup === 'dashboard' && <DashboardMockup />}
              {tab.content.mockup === 'ai' && <AIMockup />}
              {tab.content.mockup === 'expenses' && <ExpensesMockup />}
              {tab.content.mockup === 'itinerary' && <ItineraryMockup />}
            </div>

            {/* Bottom gradient fade */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
              aria-hidden="true"
              style={{ background: 'linear-gradient(to top, rgba(6,6,15,0.9), transparent)' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── ComparisonSection ────────────────────────────────────────────────────────
// Honest side-by-side showing what TravelMate does that competitors don't.

const COMPARISON_ROWS = [
  {
    feature: 'AI that knows your trip context',
    tm: true,
    tripit: false,
    wanderlog: false,
    google: false,
  },
  {
    feature: 'Live weather in destination intel',
    tm: true,
    tripit: false,
    wanderlog: true,
    google: true,
  },
  {
    feature: 'Real-time expense tracking + splits',
    tm: true,
    tripit: true,
    wanderlog: true,
    google: false,
  },
  {
    feature: 'Offline PWA — works without signal',
    tm: true,
    tripit: false,
    wanderlog: false,
    google: false,
  },
  {
    feature: 'Visa & safety intel per destination',
    tm: true,
    tripit: false,
    wanderlog: false,
    google: false,
  },
  {
    feature: 'Itinerary builder with day planning',
    tm: true,
    tripit: true,
    wanderlog: true,
    google: false,
  },
  {
    feature: 'Free with no feature limits',
    tm: true,
    tripit: false,
    wanderlog: false,
    google: true,
  },
  {
    feature: 'Budget suggestions with live rates',
    tm: true,
    tripit: false,
    wanderlog: false,
    google: false,
  },
] as const;

function ComparisonSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const cols = [
    { label: 'TravelMate', highlight: true },
    { label: 'TripIt', highlight: false },
    { label: 'Wanderlog', highlight: false },
    { label: 'Google', highlight: false },
  ] as const;

  return (
    <section className="px-5 py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="mx-auto max-w-5xl">
        <div ref={ref} className="mb-14 text-center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', damping: 20 }}
          >
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              How we compare
            </span>
            <h2
              className="text-[38px] font-black tracking-[-0.03em] text-white"
              style={{ textWrap: 'balance' } as CSSProperties}
            >
              Built for how people actually travel
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Other apps were built for a pre-AI world. TravelMate is built around what matters now:
              context-aware AI, live data, and offline access.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-x-auto rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th
                  className="py-4 pl-6 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.3)', width: '42%' }}
                >
                  Feature
                </th>
                {cols.map((c) => (
                  <th
                    key={c.label}
                    className="py-4 text-center text-[12px] font-bold"
                    style={{
                      color: c.highlight ? '#818cf8' : 'rgba(255,255,255,0.35)',
                      background: c.highlight ? 'rgba(99,102,241,0.07)' : 'transparent',
                      width: '14.5%',
                    }}
                  >
                    {c.highlight && (
                      <span
                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 align-middle"
                        aria-hidden
                      />
                    )}
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  style={{
                    borderBottom:
                      i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <td
                    className="py-3.5 pl-6 pr-4 text-[13px]"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {row.feature}
                  </td>
                  {([row.tm, row.tripit, row.wanderlog, row.google] as const).map((val, ci) => (
                    <td
                      key={ci}
                      className="py-3.5 text-center text-[16px]"
                      style={{ background: ci === 0 ? 'rgba(99,102,241,0.05)' : 'transparent' }}
                    >
                      {val ? (
                        <span style={{ color: '#34d399' }} aria-label="Yes">
                          ✓
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.15)' }} aria-label="No">
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-5 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Comparison based on publicly available feature documentation as of 2026. Subject to
          change.
        </p>
      </div>
    </section>
  );
}

// ─── AISpotlightSection ───────────────────────────────────────────────────────

const AI_MODULES = [
  {
    icon: '🌅',
    label: 'Morning Brief',
    desc: 'Flight time, weather, and top priority for the day.',
  },
  { icon: '💰', label: 'Budget Advisor', desc: 'Spend pacing alerts before you go over.' },
  { icon: '🗺️', label: 'Itinerary Optimizer', desc: 'AI reorders days for minimum travel time.' },
  {
    icon: '🎒',
    label: 'Packing Assistant',
    desc: 'Climate-aware list built around your destination.',
  },
  { icon: '🍜', label: 'Food Guide', desc: 'Neighbourhood-specific restaurant recommendations.' },
  { icon: '🛡️', label: 'Safety Advisor', desc: 'Local alerts and real-time safety briefings.' },
  { icon: '✍️', label: 'AI Journal', desc: 'One prompt generates a vivid travel narrative.' },
  { icon: '💬', label: 'Live Chat', desc: 'Ask anything. Zero API keys exposed in the browser.' },
] as const;

function AISpotlightSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div ref={ref} className="mb-14 text-center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', damping: 20 }}
          >
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              AI Concierge
            </span>
            <h2 className="text-[38px] font-black tracking-[-0.03em] text-white">
              8 AI modules. One app.
            </h2>
            <p
              className="mx-auto mt-3 max-w-lg text-[15px]"
              style={{ color: 'rgba(248,250,252,0.4)' }}
            >
              Every module runs through a secure Edge Function. Zero API keys in the browser, ever.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AI_MODULES.map((m, i) => (
            <motion.div
              key={m.label}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.055, type: 'spring', damping: 22 }}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.12)',
              }}
            >
              <div className="mb-2 text-[22px]" aria-hidden="true">
                {m.icon}
              </div>
              <div className="mb-1 text-[13px] font-semibold text-white">{m.label}</div>
              <div className="text-[12px] leading-relaxed text-white/40">{m.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, type: 'spring', damping: 22 }}
          className="mt-10 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: 'rgba(110,231,183,0.8)',
            }}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            API keys live exclusively in Supabase Edge Function secrets — never in the browser
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FreeForeverSection ───────────────────────────────────────────────────────

function FreeForeverSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          ref={ref}
          initial={reduced ? {} : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', damping: 20 }}
          className="relative overflow-hidden rounded-3xl px-10 py-16 text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 110%, rgba(16,185,129,0.07), transparent)',
            }}
          />
          <div className="relative">
            <div className="mb-4 text-[36px]" aria-hidden="true">
              💚
            </div>
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#6ee7b7' }}
            >
              Why free?
            </span>
            <h2 className="mb-4 text-[36px] font-black tracking-[-0.03em] text-white">
              Free forever. No hidden tiers.
            </h2>
            <p
              className="mx-auto mb-8 max-w-lg text-[16px] leading-relaxed"
              style={{ color: 'rgba(248,250,252,0.5)' }}
            >
              TravelMate is open source and built without a commercial model. Every feature — AI
              Concierge, real-time collaboration, expense tracking — is free to every user, always.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'All 13+ modules included',
                'AI Concierge unlimited',
                'Real-time collaboration',
                'No ads, no upsells',
                'Self-hostable',
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    color: 'rgba(110,231,183,0.7)',
                  }}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="faq" className="px-5 py-24">
      <div className="mx-auto max-w-3xl">
        <div ref={ref} className="mb-12 text-center">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: 'spring', damping: 20 }}
          >
            <span
              className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: '#818cf8' }}
            >
              FAQ
            </span>
            <h2 className="text-[38px] font-black tracking-[-0.03em] text-white">
              Common questions
            </h2>
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={reduced ? {} : { opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.05, type: 'spring', damping: 22 }}
                className="overflow-hidden rounded-2xl"
                style={{
                  background: isOpen ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isOpen
                    ? '1px solid rgba(99,102,241,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold text-white">{q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </motion.span>
                </button>

                {isOpen && (
                  <motion.div
                    initial={reduced ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-5"
                  >
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: 'rgba(248,250,252,0.5)' }}
                    >
                      {a}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, type: 'spring', damping: 22 }}
          className="mt-10 rounded-2xl px-8 py-6 text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="mb-1 text-[15px] font-semibold text-white">Still have questions?</p>
          <p className="mb-4 text-[13px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            Open an issue or start a discussion on GitHub.
          </p>
          <a
            href="https://github.com/esaipavan/TravelMate/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(248,250,252,0.7)',
            }}
          >
            <Github className="h-3.5 w-3.5" aria-hidden="true" />
            Open an issue
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Get started', href: '/register' },
  ],
  Resources: [
    { label: 'Sign in', href: '/login' },
    { label: 'Create account', href: '/register' },
    { label: 'GitHub', href: 'https://github.com/esaipavan/TravelMate', external: true },
    {
      label: 'Report a bug',
      href: 'https://github.com/esaipavan/TravelMate/issues',
      external: true,
    },
  ],
  Stack: [
    { label: 'React 18', href: 'https://react.dev', external: true },
    { label: 'Supabase', href: 'https://supabase.com', external: true },
    { label: 'Tailwind CSS', href: 'https://tailwindcss.com', external: true },
    { label: 'Framer Motion', href: 'https://framer.com/motion', external: true },
  ],
} as const;

function SiteFooter() {
  return (
    <footer
      className="px-5 pb-10 pt-16"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top grid */}
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <Plane className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.35)' }}>
              AI-powered travel planning for the modern explorer. Free forever, open source.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/esaipavan/TravelMate"
                target="_blank"
                rel="noreferrer"
                aria-label="TravelMate on GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Github className="h-3.5 w-3.5 text-white/50" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/esaipavan/TravelMate"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-white"
                style={{ color: 'rgba(248,250,252,0.4)' }}
              >
                <Star className="h-3 w-3" aria-hidden="true" />
                Star on GitHub
              </a>
            </div>
          </div>

          {/* Link columns */}
          {(
            Object.entries(FOOTER_LINKS) as [
              string,
              readonly { label: string; href: string; external?: boolean }[],
            ][]
          ).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/30">
                {section}
              </p>
              {links.map(({ label, href, external }) =>
                external ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] transition-colors hover:text-white"
                    style={{ color: 'rgba(248,250,252,0.4)' }}
                  >
                    {label}
                  </a>
                ) : href.startsWith('#') ? (
                  <a
                    key={label}
                    href={href}
                    className="text-[13px] transition-colors hover:text-white"
                    style={{ color: 'rgba(248,250,252,0.4)' }}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={label}
                    to={href}
                    className="text-[13px] transition-colors hover:text-white"
                    style={{ color: 'rgba(248,250,252,0.4)' }}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[12px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
            © {new Date().getFullYear()} {APP_NAME} · Built by Sai Pavan Etikala
          </p>
          <div className="flex flex-wrap gap-3">
            {['React 18', 'TypeScript', 'Supabase', 'Tailwind', 'Vercel'].map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(248,250,252,0.2)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── SecuritySection ──────────────────────────────────────────────────────────

function SecuritySection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const pillars = [
    {
      icon: Lock,
      title: 'End-to-end encryption',
      body: 'All data in transit is encrypted with TLS 1.3. Sensitive fields are encrypted at rest in our Supabase database.',
    },
    {
      icon: Eye,
      title: 'Zero third-party AI access',
      body: 'Your trip data never trains AI models. Our AI inference runs through isolated Edge Functions — providers see only your question, never your profile.',
    },
    {
      icon: Server,
      title: 'Row-level security',
      body: 'Every database query is user-scoped by Postgres RLS. We cannot query your data even if we wanted to.',
    },
    {
      icon: Shield,
      title: 'SOC 2 infrastructure',
      body: 'Hosted on Supabase (SOC 2 Type II) and Vercel (SOC 2 Type II). Your data never leaves enterprise-grade infrastructure.',
    },
    {
      icon: Globe2,
      title: 'GDPR & privacy by default',
      body: 'Export or delete your account and all data at any time. No dark patterns. No selling your data. Ever.',
    },
    {
      icon: Zap,
      title: 'Open security posture',
      body: 'Content Security Policy headers, HSTS preloading, and no API keys in the browser. Responsible disclosure welcome.',
    },
  ];

  return (
    <section
      ref={ref}
      className="px-5 py-24"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center"
          initial={reduced ? {} : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}
          >
            <Lock className="h-3 w-3" />
            Security
          </div>
          <h2
            className="mb-4 text-4xl font-extrabold tracking-tight text-white"
            style={{ textWrap: 'balance' } as CSSProperties}
          >
            Your data. Your rules.
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            TravelMate is built from the ground up with privacy as a feature, not an afterthought.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'rgba(16,185,129,0.12)' }}
              >
                <p.icon className="h-5 w-5" style={{ color: '#34d399' }} />
              </div>
              <h3 className="mb-2 font-semibold text-white">{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FeatureDeepDive ──────────────────────────────────────────────────────────
// Shows three core capabilities with enough detail to prove they're real.

const DEEP_FEATURES = [
  {
    tag: 'AI Assistant',
    tagColor: '#818cf8',
    tagBg: 'rgba(99,102,241,0.12)',
    headline: 'Your AI knows your entire trip',
    body: "Ask anything and TravelMate's AI already has context: your destination, dates, budget, live weather, expense history, and itinerary. No copy-pasting. No re-explaining.",
    items: [
      'Budget pacing alerts before you overspend',
      "Packing lists tuned to your destination's weather",
      'Nearest hospital, embassy, or pharmacy — instantly',
      'Suggests itinerary changes when weather shifts',
    ],
    accent: '#6366f1',
  },
  {
    tag: 'Destination Intel',
    tagColor: '#34d399',
    tagBg: 'rgba(16,185,129,0.12)',
    headline: 'Every destination, at depth',
    body: 'Real-time weather from Open-Meteo. Safety ratings. Visa requirements. Daily cost breakdowns. Must-try food. All in one page — not scattered across 5 apps.',
    items: [
      'Live 7-day forecast for any city on Earth',
      'Verified embassy & hospital contacts',
      'Street-level cost guide (budget to luxury)',
      'AI-generated local tips for any destination',
    ],
    accent: '#10b981',
  },
  {
    tag: 'Expense Tracking',
    tagColor: '#fbbf24',
    tagBg: 'rgba(245,158,11,0.12)',
    headline: 'Group splits that actually work',
    body: 'Log expenses in any currency. TravelMate converts at live rates, tracks who paid what, and shows the single transfer that settles the group. No spreadsheet needed.',
    items: [
      'Multi-currency with live Frankfurter rates',
      'Optimal settlement algorithm (minimum transfers)',
      'Per-category analytics with trend charts',
      'Offline-first — works without internet',
    ],
    accent: '#f59e0b',
  },
] as const;

function FeatureDeepDive({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="px-5 py-24"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={reduced ? {} : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span
            className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: '#818cf8' }}
          >
            What sets us apart
          </span>
          <h2
            className="text-[38px] font-black tracking-[-0.03em] text-white"
            style={{ textWrap: 'balance' } as CSSProperties}
          >
            Three things we do better
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {DEEP_FEATURES.map((f, i) => (
            <motion.div
              key={f.tag}
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl p-7"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{ background: f.tagBg, color: f.tagColor }}
              >
                {f.tag}
              </div>
              <h3 className="mb-3 text-[19px] font-bold leading-snug text-white">{f.headline}</h3>
              <p
                className="mb-6 text-[13px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {f.body}
              </p>
              <ul className="mt-auto space-y-2.5">
                {f.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[13px]"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: f.accent }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LandingPage ──────────────────────────────────────────────────────────────

function LandingPage({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="dark min-h-screen overflow-x-hidden"
      style={{ background: '#06060F', color: '#F8FAFC' }}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <CursorGlow />
      <LandingNav showBanner={false} onDismissBanner={() => undefined} />

      {/* ════════════════════════════════ HERO ════════════════════════════════ */}
      <section
        id="main-content"
        aria-label="Hero"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-8"
        style={{ paddingTop: '5rem' }}
      >
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
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
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
          <motion.div variants={reduced ? {} : stagger} initial="hidden" animate="show">
            <motion.div custom={0} variants={reduced ? {} : blurUp}>
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a5b4fc',
                }}
              >
                <span
                  className="h-2 w-2 animate-pulse rounded-full bg-indigo-400"
                  aria-hidden="true"
                />
                v2.0.0 · Production Ready · Open Source
              </div>
            </motion.div>

            <h1 className="mb-6 text-5xl font-black leading-[1.06] tracking-[-0.04em] lg:text-[68px]">
              <motion.span custom={1} variants={reduced ? {} : blurUp} className="block text-white">
                Your whole trip.
              </motion.span>
              <motion.span
                custom={2}
                variants={reduced ? {} : blurUp}
                className="block"
                style={{
                  background: 'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                One intelligent app.
              </motion.span>
            </h1>

            <motion.p
              custom={3}
              variants={reduced ? {} : blurUp}
              className="mb-9 max-w-[480px] text-[17px] leading-relaxed"
              style={{ color: 'rgba(248,250,252,0.48)' }}
            >
              Plan every day, track every dollar, and get AI guidance at every step — from departure
              to return. Free forever.
            </motion.p>

            <motion.div
              custom={4}
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
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </MagneticButton>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-medium transition-all hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(248,250,252,0.7)',
                }}
              >
                See it in action
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              custom={5}
              variants={reduced ? {} : blurUp}
              className="flex flex-wrap items-center gap-5"
            >
              {[
                {
                  icon: <Shield className="h-3.5 w-3.5" aria-hidden="true" />,
                  label: 'Supabase RLS secured',
                },
                {
                  icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
                  label: 'PWA — works offline',
                },
                {
                  icon: <Check className="h-3.5 w-3.5" aria-hidden="true" />,
                  label: 'No credit card ever',
                },
                {
                  icon: <Github className="h-3.5 w-3.5" aria-hidden="true" />,
                  label: 'Open source',
                },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-[12px] font-medium"
                  style={{ color: 'rgba(248,250,252,0.32)' }}
                >
                  <span style={{ color: '#818cf8' }}>{icon}</span>
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 72%)',
                filter: 'blur(40px)',
              }}
            />
            <div className="relative h-[480px] w-[480px]">
              <Globe reduced={reduced} />
              {/* Floating AI insight card */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: 16, x: 16 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-2 -left-6 max-w-[192px] rounded-2xl p-3.5 backdrop-blur-md"
                style={{
                  background: 'rgba(10,10,22,0.88)',
                  border: '1px solid rgba(99,102,241,0.28)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
                aria-hidden="true"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ background: 'rgba(99,102,241,0.3)' }}
                  >
                    <Sparkles className="h-2.5 w-2.5 text-indigo-300" aria-hidden="true" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                    AI insight
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/65">
                  Tokyo budget is 12% under target — consider a day trip to Nikko.
                </p>
              </motion.div>

              {/* Floating trip card */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, y: -16, x: -16 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -right-4 top-8 rounded-2xl p-3 backdrop-blur-md"
                style={{
                  background: 'rgba(10,10,22,0.88)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
                aria-hidden="true"
              >
                <div
                  className="mb-1 text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: '#6ee7b7' }}
                >
                  Active trip
                </div>
                <div className="text-[12px] font-semibold text-white">🗼 Tokyo, Japan</div>
                <div className="mt-0.5 text-[10px] text-white/45">
                  Day 4 of 10 · Budget on track
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

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

      {/* ═══════════════════════════ COMPARISON ═══════════════════════════════ */}
      <ComparisonSection reduced={reduced} />

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
                13+ modules built for the way real travellers think, plan, and explore.
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

      {/* ══════════════════════════ AI SPOTLIGHT ══════════════════════════════ */}
      <AISpotlightSection reduced={reduced} />

      {/* ══════════════════════════════ SECURITY ══════════════════════════════ */}
      <SecuritySection reduced={reduced} />

      {/* ═══════════════════════════ PRODUCT SHOWCASE ═════════════════════════ */}
      <ProductShowcase reduced={reduced} />

      {/* ══════════════════════════ FEATURE DEEP DIVE ═════════════════════════ */}
      <FeatureDeepDive reduced={reduced} />

      {/* ══════════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <HowItWorks reduced={reduced} />

      {/* ══════════════════════════ FREE FOREVER ══════════════════════════════ */}
      <FreeForeverSection reduced={reduced} />

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

      {/* ════════════════════════════════  FAQ  ═══════════════════════════════ */}
      <FAQSection reduced={reduced} />

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
                Open source · Free forever
              </p>
              <h2 className="mb-3 text-4xl font-black tracking-[-0.03em] text-white">
                Ready to travel smarter?
              </h2>
              <p
                className="mx-auto mb-9 max-w-md text-[16px]"
                style={{ color: 'rgba(248,250,252,0.5)' }}
              >
                {APP_NAME} is live, open source, and completely free to explore.
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
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
      <SiteFooter />
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
