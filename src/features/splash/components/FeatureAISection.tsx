import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';

const AI_INSIGHTS = [
  {
    emoji: '🌅',
    title: 'Morning Brief',
    text: 'Your Manali trip starts in 3 days. Pack thermals — forecast shows -2°C. Hotel check-in is at 2pm; your bus arrives at 12:30pm. Carry lunch.',
  },
  {
    emoji: '💰',
    title: 'Budget Alert',
    text: "You've spent ₹12,400 of your ₹30,000 food budget. At this pace you'll be over by ₹2,200. Consider cooking at the homestay for 2 nights.",
  },
  {
    emoji: '🎒',
    title: 'Packing Tip',
    text: 'High altitude warning: Leh is at 3,500m. Pack altitude sickness tablets, lip balm, sunscreen SPF 50+, and warm layers even in July.',
  },
];

export function FeatureAISection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActiveInsight((i) => (i + 1) % AI_INSIGHTS.length), 3500);
    return () => clearInterval(id);
  }, [reduced]);

  const anim = reduced
    ? {}
    : { initial: { opacity: 0, y: 28 }, animate: inView ? { opacity: 1, y: 0 } : {} };

  return (
    <section
      id="ai"
      className="bg-[#FAFAF7] py-20 dark:bg-gray-950"
      aria-label="AI Concierge feature"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div ref={ref} className="flex flex-col-reverse items-center gap-14 lg:flex-row lg:gap-20">
          {/* Right: cycling insight card (shown first on mobile via flex-col-reverse) */}
          <motion.div
            className="w-full max-w-sm flex-shrink-0"
            {...(reduced
              ? {}
              : { initial: { opacity: 0, x: 32 }, animate: inView ? { opacity: 1, x: 0 } : {} })}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Card: decorative, hidden from screen readers */}
            <div
              className="overflow-hidden rounded-2xl bg-gray-900"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', minHeight: 200 }}
              aria-hidden="true"
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                  <span className="ml-2 text-[12px] text-white/30">TravelMate AI</span>
                </div>
              </div>
              <div className="p-5" style={{ minHeight: 140 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInsight}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? {} : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xl">{AI_INSIGHTS[activeInsight].emoji}</span>
                      <span className="text-[13px] font-semibold text-white">
                        {AI_INSIGHTS[activeInsight].title}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/65">
                      {AI_INSIGHTS[activeInsight].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Dot indicators: OUTSIDE the aria-hidden card, keyboard accessible */}
            <div
              className="mt-3 flex justify-center gap-1.5"
              role="group"
              aria-label="AI insight examples"
            >
              {AI_INSIGHTS.map((insight, i) => (
                <button
                  key={i}
                  onClick={() => setActiveInsight(i)}
                  className="rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  style={{
                    height: 6,
                    width: i === activeInsight ? 20 : 6,
                    background: i === activeInsight ? '#F59E0B' : 'rgba(107,114,128,0.4)',
                  }}
                  aria-label={`Show ${insight.title} example`}
                  aria-pressed={i === activeInsight}
                />
              ))}
            </div>
          </motion.div>

          {/* Left: copy */}
          <motion.div
            className="flex-1"
            {...anim}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-4 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              AI Concierge
            </span>
            <h2 className="mb-4 text-[32px] font-bold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-[40px]">
              An AI that knows your whole trip.
            </h2>
            <p className="mb-6 text-[17px] leading-[1.65] text-gray-500 dark:text-gray-400">
              Get a morning brief, packing list, budget alerts, and safety tips — all tailored to
              your specific itinerary. Not generic advice.
            </p>

            {/* Scenario card */}
            <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800/50 dark:bg-blue-950/30">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                Example · Manali
              </p>
              <p className="text-[14px] leading-relaxed text-blue-900 dark:text-blue-200">
                🌅 "Your Manali trip starts in 3 days. Pack thermals — forecast shows -2°C. Hotel
                check-in is at 2pm; your bus arrives at 12:30pm. Carry lunch."
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Get started — it's free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
