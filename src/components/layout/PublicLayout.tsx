import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin, Plane, Sparkles, Wallet } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { CARD_VARIANTS, rv } from '@/lib/motion';

const HERO_IMG =
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1280&q=80';

const FEATURES = [
  { icon: MapPin, text: 'Kedarnath to Goa — day-by-day AI itineraries' },
  { icon: Wallet, text: 'Group expenses in ₹ — split fairly, settle fast' },
  { icon: Sparkles, text: 'AI morning briefs, packing lists & safety tips' },
] as const;

export function PublicLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="dark flex min-h-screen" style={{ background: '#06060F' }}>
      {/* ── Left branding panel (desktop only) ─────────────────────────── */}
      <div className="relative hidden flex-col items-center justify-between overflow-hidden px-10 py-12 lg:flex lg:w-[44%] xl:w-[42%]">
        {/* Indian travel photo — same hero as landing page */}
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Gradient overlay — mirrors landing page hero style */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(6,6,15,0.82) 0%, rgba(6,6,15,0.4) 45%, rgba(6,6,15,0.85) 100%)',
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 self-start">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 shadow-sm">
            <Plane className="h-[18px] w-[18px] text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        {/* Center — tagline + preview card + features */}
        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(251,191,36,0.85)' }}
          >
            Apna trip, apni planning
          </p>
          <div>
            <p className="text-[28px] font-bold leading-tight tracking-[-0.025em] text-white">
              Plan your best
            </p>
            <p
              className="text-[28px] font-bold leading-tight tracking-[-0.025em]"
              style={{ color: '#F59E0B' }}
            >
              India trips.
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Built for Indian travellers. Free, forever.
          </p>

          {/* AI Morning Brief preview card */}
          <div
            className="w-full max-w-[280px] rounded-2xl p-4 text-left"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.13)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#F59E0B' }}
            >
              🌅 Today's Morning Brief
            </p>
            <p className="text-[13px] font-bold text-white">Your Manali trip starts in 3 days</p>
            <p
              className="mt-1.5 text-[12px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.58)' }}
            >
              Pack thermals — forecast shows −2 °C. Hotel check-in at 2 pm, bus arrives 12:30 pm.
            </p>
            <div
              className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium"
              style={{
                background: 'rgba(245,158,11,0.14)',
                border: '1px solid rgba(245,158,11,0.24)',
                color: 'rgba(251,191,36,0.9)',
              }}
            >
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
              AI-generated every morning for your trip
            </div>
          </div>

          {/* Feature bullets */}
          <ul className="w-full max-w-[280px] space-y-3 text-left">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-sm"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.22)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 self-start text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-10">
        {/* Ambient orbs — blue/amber matching landing page palette */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(29,78,216,0.07) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 h-56 w-56 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Mobile logo */}
        <div className="relative z-10 mb-7 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 shadow-sm">
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
              boxShadow: '0 0 80px rgba(29,78,216,0.08), 0 24px 64px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(24px)',
            }}
            variants={rv(CARD_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* Inner glow — blue tint matching landing page */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(29,78,216,0.07) 0%, transparent 55%)',
              }}
            />
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
