import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80';

const blurUpVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 22, stiffness: 65, delay: i * 0.1 },
  }),
};

const blurUpReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};

export function HeroSection() {
  const reduced = useReducedMotion() ?? false;
  const variants = reduced ? blurUpReduced : blurUpVariants;

  return (
    <>
      {/* ── Mobile hero: full-bleed photo ─── */}
      <section className="relative min-h-[88vh] overflow-hidden lg:hidden" aria-label="Hero">
        <motion.div
          className="absolute inset-0"
          animate={reduced ? {} : { scale: 1.06 }}
          transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        >
          <img
            src={HERO_IMAGE}
            alt="Travellers on a Himalayan mountain road in India at golden hour"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-20">
          <p className="mb-3 text-[13px] font-medium tracking-wide text-amber-300/80">
            Apna trip, apni planning
          </p>
          <h1 className="mb-3 text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-white">
            Your AI travel companion for India.
          </h1>
          <p className="mb-7 text-[15px] leading-relaxed text-white/75">
            Plan any trip from Kedarnath to Goa. AI creates your itinerary, tracks group expenses,
            and organizes bookings — all free.
          </p>
          <Link
            to="/register"
            className="mb-4 flex items-center justify-center gap-2 rounded-xl py-4 text-[16px] font-bold text-gray-900 transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B' }}
          >
            Start planning free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-center text-[12px] text-white/55">
            No credit card · Sign in with Google · Built for India
          </p>
        </div>
      </section>

      {/* ── Desktop hero: split layout ─── */}
      <section
        id="main-content"
        className="relative hidden min-h-screen items-center overflow-hidden bg-gradient-to-br from-blue-50 to-[#FAFAF7] dark:from-gray-900 dark:to-gray-950 lg:flex"
        aria-label="Hero"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center gap-16 px-8 py-28">
          {/* Left: copy */}
          <motion.div
            className="flex-1"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p
              custom={0}
              variants={variants}
              className="mb-4 text-[13px] font-semibold uppercase tracking-widest text-amber-500"
            >
              Apna trip, apni planning
            </motion.p>
            <motion.h1
              custom={1}
              variants={variants}
              className="mb-5 text-[56px] font-extrabold leading-[1.08] tracking-[-0.03em] text-gray-900 dark:text-white"
            >
              Your AI travel companion for India.
            </motion.h1>
            <motion.p
              custom={2}
              variants={variants}
              className="mb-8 max-w-lg text-[18px] leading-[1.65] text-gray-500 dark:text-gray-400"
            >
              Plan any trip from Kedarnath to Goa. AI creates your itinerary, suggests required
              documents, tracks group expenses, and organizes bookings. Free, forever.
            </motion.p>
            <motion.div
              custom={3}
              variants={variants}
              className="mb-5 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[16px] font-bold text-gray-900 transition-all hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background: '#F59E0B',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
                }}
              >
                Start planning free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#showcase"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-[16px] font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
              >
                See what's inside
              </a>
            </motion.div>
            <motion.div
              custom={4}
              variants={variants}
              className="flex flex-wrap items-center gap-5 text-[13px] text-gray-400 dark:text-gray-500"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" />
                No credit card needed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                Sign in with Google
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                Built for India
              </span>
            </motion.div>
          </motion.div>

          {/* Right: phone mockup */}
          <motion.div
            className="flex-shrink-0"
            initial={reduced ? false : { opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <AppMockup />
          </motion.div>
        </div>
      </section>
    </>
  );
}

function AppMockup() {
  return (
    <div
      className="relative w-[280px] overflow-hidden rounded-[2.5rem] bg-gray-900"
      style={{
        height: 540,
        boxShadow:
          '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pb-2 pt-5">
        <span className="text-[11px] font-semibold text-white/50">9:41</span>
        <div className="flex items-center gap-1">
          {[3, 4, 5].map((h, i) => (
            <div key={i} className="w-[3px] rounded-sm bg-white/50" style={{ height: h }} />
          ))}
          <div className="ml-1.5 h-3 w-6 rounded-sm border border-white/30 p-0.5">
            <div className="h-full w-3/4 rounded-sm bg-white/50" />
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-white/40">Good morning, Rahul</p>
        <p className="text-[17px] font-bold text-white">Manali Trip ✈️</p>
      </div>

      {/* Morning brief card */}
      <div
        className="mx-4 rounded-2xl p-4"
        style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-base">🌅</span>
          <span className="text-[12px] font-semibold text-white">Morning Brief</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/70">
          Trip starts in <span className="font-semibold text-amber-300">3 days</span>. Pack thermals
          — forecast -2°C. Hotel check-in 2pm; bus arrives 12:30pm.
        </p>
      </div>

      {/* Budget */}
      <div
        className="mx-4 mt-3 flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div>
          <p className="text-[10px] text-white/40">Budget remaining</p>
          <p className="text-[15px] font-bold text-white">₹ 18,500</p>
        </div>
        <span
          className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-emerald-300"
          style={{ background: 'rgba(16,185,129,0.15)' }}
        >
          On track
        </span>
      </div>

      {/* Today's plan */}
      <div className="mx-4 mt-4">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Today
        </p>
        {['Rohtang Pass', 'Hadimba Temple', 'Mall Road dinner'].map((item) => (
          <div key={item} className="mb-2.5 flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
            <p className="text-[12px] text-white/65">{item}</p>
          </div>
        ))}
      </div>

      {/* Bottom tab bar */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-around px-6 pb-6 pt-4"
        style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(12px)' }}
      >
        {(['🗺️', '💰', '🤖', '📖'] as const).map((emoji, i) => (
          <div
            key={emoji}
            className={`text-lg transition-transform ${i === 2 ? 'scale-125' : 'opacity-40'}`}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
