import { useRef } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface Step {
  step: string;
  title: string;
  desc: string;
  accent: string;
  isGoogle?: boolean;
  icon?: LucideIcon;
}

const STEPS: Step[] = [
  {
    step: '01',
    isGoogle: true,
    title: 'Sign in with Google',
    desc: 'One tap with your Google account. No credit card, no form. Takes 10 seconds.',
    accent: '#1D4ED8',
  },
  {
    step: '02',
    icon: MapPin,
    title: 'Create your trip',
    desc: 'Add your destination and dates. Invite friends. Everything syncs instantly.',
    accent: '#10B981',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'Let AI handle the rest',
    desc: 'Morning briefs, budget alerts, packing lists — your AI companion takes over from here.',
    accent: '#8B5CF6',
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="how-it-works"
      className="py-20"
      style={{ background: '#FAFAF7' }}
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-[32px] font-bold tracking-tight text-gray-900 sm:text-[40px]">
            Up and running in 3 steps
          </h2>
          <p className="mx-auto max-w-lg text-[17px] text-gray-500">
            No setup, no credit card, no learning curve.
          </p>
        </div>

        <div ref={ref} className="grid gap-8 sm:grid-cols-3" role="list" aria-label="Steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                role="listitem"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: s.accent + '15' }}
                  >
                    {s.isGoogle ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        aria-label="Google"
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
                    ) : Icon ? (
                      <Icon className="h-6 w-6" style={{ color: s.accent }} aria-hidden="true" />
                    ) : null}
                  </div>
                  <span className="text-[13px] font-bold tracking-widest text-gray-300">
                    {s.step}
                  </span>
                </div>
                <h3 className="mb-2 text-[18px] font-bold text-gray-900">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center text-[13px] text-gray-400"
        >
          Works in Goa · Ladakh · Bali · Dubai · Manali · Paris · Tokyo and everywhere else
        </motion.p>
      </div>
    </section>
  );
}
