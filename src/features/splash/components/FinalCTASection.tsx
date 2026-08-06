import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const DESTINATIONS = [
  'Goa',
  'Ladakh',
  'Bali',
  'Dubai',
  'Manali',
  'Paris',
  'Tokyo',
  'Coorg',
  'Varanasi',
  'Maldives',
  'Rajasthan',
  'Singapore',
];

export function FinalCTASection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="relative overflow-hidden py-24"
      style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
      aria-label="Get started"
    >
      {/* Decorative destination names */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-6 px-10 opacity-30"
        aria-hidden="true"
      >
        {DESTINATIONS.map((d) => (
          <span
            key={d}
            className="text-[28px] font-black tracking-tight text-blue-300 sm:text-[40px]"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative mx-auto max-w-xl px-5 text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mb-4 text-[36px] font-extrabold tracking-tight text-gray-900 sm:text-[48px]">
            Ready to plan your next trip?
          </h2>
          <p className="mb-8 text-[17px] text-gray-500">
            Join travellers planning trips across India and the world. Free forever, no card needed.
          </p>

          {/* Primary CTA */}
          <Link
            to="/register"
            className="mb-4 flex items-center justify-center gap-2 rounded-xl py-4 text-[17px] font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:mx-auto sm:w-max sm:px-10"
            style={{
              background: '#F59E0B',
              boxShadow: '0 6px 24px rgba(245,158,11,0.38)',
            }}
          >
            Start planning — it's free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Google sign-in indicator */}
          <div className="mb-4 flex items-center justify-center gap-2 text-[14px] text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google · No credit card
          </div>

          <Link
            to="/login"
            className="text-[14px] font-medium text-gray-400 transition-colors hover:text-gray-700"
          >
            Already have an account? Sign in →
          </Link>

          <p className="mt-6 text-[12px] text-gray-400">
            No credit card · Free forever · Works in India and worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
}
