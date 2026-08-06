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
      id="features"
      className="py-20"
      style={{ background: '#FAFAF7' }}
      aria-label="AI Concierge feature"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div ref={ref} className="flex flex-col items-center gap-14 lg:flex-row lg:gap-20">
          {/* Left: copy */}
          <motion.div
            className="flex-1"
            {...anim}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-4 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-700">
              AI Concierge
            </span>
            <h2 className="mb-4 text-[32px] font-bold leading-[1.2] tracking-tight text-gray-900 sm:text-[40px]">
              An AI that knows your whole trip.
            </h2>
            <p className="mb-6 text-[17px] leading-[1.65] text-gray-500">
              Get a morning brief, packing list, budget alerts, and safety tips — all tailored to
              your specific itinerary. Not generic advice.
            </p>

            {/* Scenario card */}
            <div
              className="mb-7 rounded-2xl p-5"
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
              }}
            >
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-500">
                Example
              </p>
              <p className="text-[14px] leading-relaxed text-blue-900">
                🌅 "Your Manali trip starts in 3 days. Pack thermals — forecast shows -2°C. Hotel
                check-in is at 2pm; your bus arrives at 12:30pm. Carry lunch."
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue-700 transition-colors hover:text-blue-900"
            >
              See all 8 AI modules
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Right: cycling insight card */}
          <motion.div
            className="w-full max-w-sm flex-shrink-0"
            {...(reduced
              ? {}
              : { initial: { opacity: 0, x: 32 }, animate: inView ? { opacity: 1, x: 0 } : {} })}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div
              className="overflow-hidden rounded-2xl bg-gray-900"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', minHeight: 200 }}
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
              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5 pb-4">
                {AI_INSIGHTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveInsight(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === activeInsight ? 20 : 6,
                      background: i === activeInsight ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                    }}
                    aria-label={`Show insight ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
