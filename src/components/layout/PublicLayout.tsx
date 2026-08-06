import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin, Plane, Wallet, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { CARD_VARIANTS, rv } from '@/lib/motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type LatLon = [number, number];

// ─── Globe data ───────────────────────────────────────────────────────────────

const CITIES: LatLon[] = [
  [28.6, 77.2], // Delhi
  [19.1, 72.9], // Mumbai
  [12.97, 77.59], // Bangalore
  [17.4, 78.5], // Hyderabad
  [51.5, -0.1], // London
  [1.3, 103.8], // Singapore
  [25.2, 55.3], // Dubai
  [48.9, 2.4], // Paris
  [35.7, 139.7], // Tokyo
];

const ARCS: [LatLon, LatLon][] = [
  [
    [28.6, 77.2],
    [25.2, 55.3],
  ], // Delhi → Dubai
  [
    [19.1, 72.9],
    [1.3, 103.8],
  ], // Mumbai → Singapore
  [
    [12.97, 77.59],
    [48.9, 2.4],
  ], // Bangalore → Paris
];

// ─── Left panel features ──────────────────────────────────────────────────────

const FEATURES = [
  { icon: MapPin, text: 'Kedarnath to Goa — day-by-day AI itineraries' },
  { icon: Wallet, text: 'Group expenses in ₹ — split fairly, settle fast' },
  { icon: Sparkles, text: 'AI morning briefs, packing lists & safety tips' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(135deg, hsl(237 72% 59%), hsl(271 77% 58%))';

function lerpLL(a: LatLon, b: LatLon, t: number): LatLon {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function project(lat: number, lon: number, rotY: number, cx: number, cy: number, R: number) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180 + rotY;
  const x3 = Math.cos(phi) * Math.cos(theta);
  const y3 = Math.sin(phi);
  const z3 = Math.cos(phi) * Math.sin(theta);
  return { x: cx + x3 * R, y: cy - y3 * R, z: z3 };
}

// ─── MiniGlobe ───────────────────────────────────────────────────────────────

function MiniGlobe({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ rotY: 0, arcT: 0, lastTs: 0, raf: 0 });

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const SIZE = 280;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    const s = stateRef.current;

    function draw(ts: number) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dt = s.lastTs ? Math.min((ts - s.lastTs) / 1000, 0.05) : 0;
      s.lastTs = ts;
      s.rotY += dt * 0.35;
      s.arcT = (s.arcT + dt * 0.22) % 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const R = SIZE * 0.4;
      const rotY = s.rotY;
      const proj = (lat: number, lon: number) => project(lat, lon, rotY, cx, cy, R);

      // Atmosphere
      const atmo = ctx.createRadialGradient(cx * 0.8, cy * 0.8, 0, cx, cy, R * 1.25);
      atmo.addColorStop(0, 'rgba(124,108,221,0.2)');
      atmo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let go = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = proj(lat, lon);
          if (p.z < -0.05) {
            go = false;
            continue;
          }
          if (!go) {
            ctx.moveTo(p.x, p.y);
            go = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = 'rgba(124,108,221,0.22)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        let go = false;
        for (let lat = -85; lat <= 85; lat += 3) {
          const p = proj(lat, lon);
          if (p.z < -0.05) {
            go = false;
            continue;
          }
          if (!go) {
            ctx.moveTo(p.x, p.y);
            go = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = 'rgba(124,108,221,0.22)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // City dots
      for (const [lat, lon] of CITIES) {
        const p = proj(lat, lon);
        if (p.z < 0) continue;
        const a = (p.z + 0.3) / 1.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,106,232,${a})`;
        ctx.fill();
      }

      // Flight arcs + comet heads
      for (let i = 0; i < ARCS.length; i++) {
        const [cityA, cityB] = ARCS[i];
        const t = (s.arcT + i * 0.33) % 1;

        ctx.beginPath();
        let go = false;
        for (let step = 0; step <= 1; step += 0.02) {
          const [la, lo] = lerpLL(cityA, cityB, step);
          const p = proj(la, lo);
          if (p.z < 0) {
            go = false;
            continue;
          }
          if (!go) {
            ctx.moveTo(p.x, p.y);
            go = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = 'rgba(124,108,221,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const [hLat, hLon] = lerpLL(cityA, cityB, t);
        const head = proj(hLat, hLon);
        if (head.z >= 0) {
          const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9);
          grd.addColorStop(0, 'rgba(155,106,232,0.7)');
          grd.addColorStop(1, 'rgba(155,106,232,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(220,210,255,0.95)';
          ctx.fill();
        }
      }

      s.raf = requestAnimationFrame(draw);
    }

    s.raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(s.raf);
  }, [paused]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function PublicLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="dark flex min-h-screen" style={{ background: '#06060F' }}>
      {/* ── Left branding panel (desktop only) ─────────────────────────── */}
      <div
        className="relative hidden flex-col items-center justify-between overflow-hidden px-10 py-12 lg:flex lg:w-[44%] xl:w-[42%]"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Ambient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-24 -top-24 h-96 w-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,108,221,0.18) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-16 right-0 h-72 w-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(155,106,232,0.12) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 self-start">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: GRAD }}
          >
            <Plane className="h-[18px] w-[18px] text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        {/* Globe + tagline + features */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <MiniGlobe paused={reduced ?? false} />

          <div className="text-center">
            <p
              className="mb-1 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Apna trip, apni planning
            </p>
            <p className="text-2xl font-bold leading-tight tracking-tight text-white">
              Plan your best
              <br />
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                India trips.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Built for Indian travellers. Free, forever.
            </p>
          </div>

          <ul className="w-full max-w-[260px] space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-sm"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: 'rgba(124,108,221,0.15)',
                    border: '1px solid rgba(124,108,221,0.25)',
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: 'hsl(257 60% 72%)' }}
                    aria-hidden="true"
                  />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 self-start text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-10">
        {/* Ambient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,108,221,0.08) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(155,106,232,0.07) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Mobile logo */}
        <div className="relative z-10 mb-7 flex items-center gap-2 lg:hidden">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: GRAD }}
          >
            <Plane className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold tracking-tight text-white">{APP_NAME}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 80px rgba(124,108,221,0.1), 0 24px 64px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(24px)',
            }}
            variants={rv(CARD_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* Gradient inner glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(124,108,221,0.1) 0%, transparent 55%)',
              }}
            />
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
