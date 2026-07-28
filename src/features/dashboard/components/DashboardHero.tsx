import { useRef } from 'react';
import { format } from 'date-fns';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { CurrentTripCard } from './CurrentTripCard';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(fullName: string | undefined, email: string | undefined): string {
  if (fullName?.trim()) return fullName.trim().split(' ')[0];
  if (email) return email.split('@')[0];
  return 'Traveler';
}

/* ── Destination pins ─────────────────────────────────────────── */
interface PinDef {
  label: string;
  left: number;
  top: number;
  color: string;
  rgb: string;
  pulse: boolean;
}

const PINS: PinDef[] = [
  { label: 'New York', left: 14, top: 68, color: '#3b82f6', rgb: '59,130,246', pulse: false },
  { label: 'London', left: 37, top: 36, color: '#8b5cf6', rgb: '139,92,246', pulse: false },
  { label: 'Dubai', left: 60, top: 48, color: '#f59e0b', rgb: '245,158,11', pulse: true },
  { label: 'Tokyo', left: 84, top: 30, color: '#10b981', rgb: '16,185,129', pulse: false },
];

/* ── World map SVG ────────────────────────────────────────────── */
function WorldMapSVG() {
  return (
    <svg
      viewBox="0 0 500 280"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        {/* Dot grid pattern */}
        <pattern id="tm-dot-grid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.18" />
        </pattern>
        {/* Route gradient */}
        <linearGradient id="tm-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="33%" stopColor="#8b5cf6" />
          <stop offset="66%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        {/* Continent fill */}
        <filter id="tm-land-blur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Dot grid */}
      <rect width="500" height="280" fill="url(#tm-dot-grid)" />

      {/* Continent blobs — very simplified at low opacity */}
      <g opacity="0.07" filter="url(#tm-land-blur)">
        {/* Americas */}
        <path
          d="M 50,72 C 62,44 100,46 110,78 C 120,108 112,148 98,165 C 84,178 58,174 48,156 C 35,135 38,100 50,72 Z
             M 93,168 C 104,188 108,224 96,244 C 84,252 70,242 72,220 C 75,200 85,184 93,168 Z"
          fill="currentColor"
        />
        {/* Europe / Africa */}
        <path
          d="M 200,68 C 213,48 240,54 244,78 C 248,102 234,130 218,138 L 212,188 C 207,218 200,244 206,258 C 188,252 180,226 184,198 L 178,156 C 166,130 165,88 200,68 Z"
          fill="currentColor"
        />
        {/* Asia */}
        <path
          d="M 280,52 C 334,28 418,40 438,78 C 452,104 440,136 416,148 C 388,162 350,155 318,144 C 290,134 272,112 272,90 C 270,70 274,60 280,52 Z"
          fill="currentColor"
        />
        {/* SE Asia / Australia */}
        <path
          d="M 418,172 C 440,160 465,167 468,186 C 471,202 459,218 443,222 C 426,226 406,214 404,197 Z"
          fill="currentColor"
        />
      </g>

      {/* Animated travel route */}
      <motion.path
        d="M 70,190 C 118,142 162,108 200,112 C 238,116 270,132 302,136 C 348,142 408,108 448,96"
        stroke="url(#tm-route-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Route dots at each city */}
      {[
        { cx: 70, cy: 190, color: '#3b82f6', delay: 0.9 },
        { cx: 200, cy: 112, color: '#8b5cf6', delay: 1.5 },
        { cx: 302, cy: 136, color: '#f59e0b', delay: 2.1 },
        { cx: 448, cy: 96, color: '#10b981', delay: 2.7 },
      ].map((dot) => (
        <motion.circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={3.5}
          fill={dot.color}
          style={{ filter: `drop-shadow(0 0 4px ${dot.color})` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: dot.delay, type: 'spring', damping: 12, stiffness: 200 }}
        />
      ))}
    </svg>
  );
}

/* ── Entrance variants ────────────────────────────────────────── */
const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};
const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};
const CARD_SPRING = {
  hidden: { opacity: 0, scale: 0.95, y: 28 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 24, stiffness: 88, delay: 0.18 },
  },
};

/* ── DashboardHero ────────────────────────────────────────────── */
export function DashboardHero() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const name = firstName(user?.user_metadata?.full_name as string | undefined, user?.email);
  const today = format(new Date(), 'EEEE, MMMM d');
  const greet = greeting();

  const { data: active, isLoading } = useCurrentTrip();
  const { data: upcoming = [] } = useUpcomingTrips();
  const displayTrip = active ?? (upcoming.length > 0 ? upcoming[0] : null);

  /* Parallax mouse tracking */
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sp = { damping: 28, stiffness: 80 };
  const smx = useSpring(mx, sp);
  const smy = useSpring(my, sp);

  const blob1X = useTransform(smx, [0, 1], [-28, 28]);
  const blob1Y = useTransform(smy, [0, 1], [-20, 20]);
  const blob2X = useTransform(smx, [0, 1], [-14, 14]);
  const blob2Y = useTransform(smy, [0, 1], [-10, 10]);
  const blob3X = useTransform(smx, [0, 1], [-8, 8]);
  const blob3Y = useTransform(smy, [0, 1], [-6, 6]);
  const mapX = useTransform(smx, [0, 1], [-6, 6]);
  const mapY = useTransform(smy, [0, 1], [-4, 4]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div
      ref={heroRef}
      className="relative -mx-4 -mt-4 mb-8 overflow-hidden lg:-mx-6 lg:-mt-6"
      onMouseMove={reduced ? undefined : onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Aurora atmosphere ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blob 1 — primary blue, parallax layer 1 */}
        <motion.div
          className="absolute rounded-full opacity-[0.22] blur-[130px] dark:opacity-[0.14]"
          style={{
            background: 'hsl(221 83% 53%)',
            width: 560,
            height: 560,
            top: '-22%',
            left: '-10%',
            x: reduced ? 0 : blob1X,
            y: reduced ? 0 : blob1Y,
          }}
        />
        {/* Blob 2 — violet, parallax layer 2 */}
        <motion.div
          className="absolute rounded-full opacity-[0.16] blur-[100px] dark:opacity-[0.10]"
          style={{
            background: 'hsl(262 83% 58%)',
            width: 400,
            height: 400,
            bottom: '-8%',
            right: '10%',
            x: reduced ? 0 : blob2X,
            y: reduced ? 0 : blob2Y,
          }}
        />
        {/* Blob 3 — amber, parallax layer 3 */}
        <motion.div
          className="absolute rounded-full opacity-[0.10] blur-[80px] dark:opacity-[0.06]"
          style={{
            background: 'hsl(38 92% 50%)',
            width: 240,
            height: 240,
            top: '32%',
            right: '35%',
            x: reduced ? 0 : blob3X,
            y: reduced ? 0 : blob3Y,
          }}
        />

        {/* Animated aurora mesh lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.05]"
          aria-hidden
        >
          <defs>
            <linearGradient id="tm-hero-mesh" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(221,83%,53%)" />
              <stop offset="100%" stopColor="hsl(262,83%,58%)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={`${i * 25}%`}
              y1="0%"
              x2={`${100 - i * 18}%`}
              y2="100%"
              stroke="url(#tm-hero-mesh)"
              strokeWidth="1"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <line
              key={`h${i}`}
              x1="0%"
              y1={`${i * 50}%`}
              x2="100%"
              y2={`${100 - i * 30}%`}
              stroke="url(#tm-hero-mesh)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.018] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,1) 1px,transparent 1px),' +
              'linear-gradient(90deg,rgba(100,116,139,1) 1px,transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        {/* Stars (dark-mode only) */}
        {[
          { l: '8%', t: '18%', s: 2, o: 0.55 },
          { l: '19%', t: '42%', s: 1.5, o: 0.35 },
          { l: '54%', t: '10%', s: 2.5, o: 0.5 },
          { l: '72%', t: '30%', s: 1.5, o: 0.38 },
          { l: '87%', t: '52%', s: 2, o: 0.48 },
          { l: '36%', t: '72%', s: 1, o: 0.28 },
          { l: '93%', t: '16%', s: 1.5, o: 0.42 },
          { l: '13%', t: '80%', s: 1, o: 0.22 },
          { l: '63%', t: '78%', s: 2, o: 0.4 },
          { l: '44%', t: '55%', s: 1, o: 0.2 },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute hidden rounded-full bg-white dark:block"
            style={{ left: s.l, top: s.t, width: s.s, height: s.s, opacity: s.o }}
          />
        ))}

        {/* World map (right portion of hero, very subtle) */}
        <motion.div
          className="absolute right-0 top-0 h-full w-2/3 text-foreground opacity-[0.055] dark:opacity-[0.04]"
          style={reduced ? {} : { x: mapX, y: mapY }}
        >
          <WorldMapSVG />
        </motion.div>

        {/* Floating destination pins */}
        {!reduced &&
          PINS.map((pin, i) => (
            <motion.div
              key={pin.label}
              className="pointer-events-none absolute"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
              initial={{ opacity: 0, scale: 0, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.2, type: 'spring', damping: 14, stiffness: 180 }}
            >
              <div className="relative">
                {/* Outer pulse ring */}
                {pin.pulse && (
                  <span
                    className="absolute inset-0 -m-2 animate-ping rounded-full"
                    style={{ background: pin.color, opacity: 0.35 }}
                  />
                )}
                {/* Inner pulse ring (slower) */}
                <span
                  className="absolute inset-0 -m-1 animate-pulse rounded-full"
                  style={{ background: pin.color, opacity: 0.2 }}
                />
                {/* Pin dot */}
                <div
                  className="relative z-10 h-2.5 w-2.5 rounded-full ring-[1.5px] ring-white/50"
                  style={{
                    background: pin.color,
                    boxShadow: `0 0 10px rgba(${pin.rgb},0.6), 0 0 4px rgba(${pin.rgb},0.8)`,
                  }}
                />
                {/* Label */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/85 px-1.5 py-0.5 text-[9px] font-semibold text-foreground/65 ring-1 ring-border/20 backdrop-blur-md">
                  {pin.label}
                </span>
              </div>
            </motion.div>
          ))}
      </div>

      {/* ── Content grid ──────────────────────────────────── */}
      <motion.div
        className="relative grid gap-8 px-4 pb-10 pt-8 lg:grid-cols-5 lg:items-center lg:gap-12 lg:px-6 lg:pb-12 lg:pt-10"
        variants={reduced ? undefined : CONTAINER}
        initial={reduced ? undefined : 'hidden'}
        animate={reduced ? undefined : 'show'}
      >
        {/* Greeting column */}
        <motion.div className="space-y-5 lg:col-span-2" variants={reduced ? undefined : FADE_UP}>
          {/* Date pill */}
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {today}
          </span>

          {/* Greeting headline */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{greet},</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {name}
            </h1>
          </div>

          {/* Sub-message */}
          <p className="max-w-xs text-base leading-relaxed text-muted-foreground">
            {displayTrip
              ? active
                ? `You're currently travelling to ${displayTrip.destination}.`
                : `Your next adventure is coming up — ${displayTrip.destination}.`
              : 'Ready to plan your next adventure?'}
          </p>
        </motion.div>

        {/* Trip card column */}
        <motion.div className="lg:col-span-3" variants={reduced ? undefined : CARD_SPRING}>
          <CurrentTripCard trip={displayTrip} isLoading={isLoading} />
        </motion.div>
      </motion.div>
    </div>
  );
}
