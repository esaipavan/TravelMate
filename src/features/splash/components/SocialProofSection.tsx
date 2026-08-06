import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote:
      'Planning our Ladakh road trip was so much easier with the day-by-day AI itinerary. It even reminded us about altitude sickness tablets!',
    name: 'Neha S.',
    location: 'Mumbai',
    avatar: 'N',
    color: '#6366F1',
  },
  {
    quote:
      'The budget split feature saved so many awkward conversations in our Goa group trip. Everyone could see exactly who owed what.',
    name: 'Rahul M.',
    location: 'Delhi',
    avatar: 'R',
    color: '#10B981',
  },
  {
    quote:
      'The AI morning brief is like having a travel agent in your pocket. It told me my train had changed platforms before I even checked.',
    name: 'Priya K.',
    location: 'Pune',
    avatar: 'P',
    color: '#F59E0B',
  },
] as const;

function CountUp({ target, reduced }: { target: number; reduced: boolean }) {
  const [count, setCount] = useState(reduced ? target : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || reduced) return;
    const duration = 1400;
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, target, reduced]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>;
}

export function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="py-20" style={{ background: '#F3F4F6' }} aria-label="Social proof">
      <div className="mx-auto max-w-6xl px-5">
        {/* Trip count stat */}
        <div className="mb-16 text-center">
          <p className="mb-1 text-[52px] font-extrabold tracking-tight text-blue-700 sm:text-[64px]">
            <CountUp target={500} reduced={reduced} />+
          </p>
          <p className="text-[16px] text-gray-500">
            trips planned by travellers across India — Manali, Goa, Kerala, Dubai, and beyond
          </p>
        </div>

        {/* Testimonials */}
        <div
          ref={ref}
          className="grid gap-6 sm:grid-cols-3"
          role="list"
          aria-label="User testimonials"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-white p-6"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} className="text-[15px] text-amber-400" aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="mb-4 text-[14px] leading-relaxed text-gray-600">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                  style={{ background: t.color }}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{t.name}</p>
                  <p className="text-[12px] text-gray-400">{t.location}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-gray-400">
          Testimonials are representative of early users. We'll update this with real reviews as the
          community grows.
        </p>
      </div>
    </section>
  );
}
