import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: 'Is TravelMate really free?',
    a: 'Yes — completely free, forever. No premium tier, no trial period. All features including the AI Concierge, budget tracking, and real-time collaboration are included at zero cost.',
  },
  {
    q: 'Do I need to enter a credit card?',
    a: 'Never. TravelMate is free forever. We ask for nothing except your Google account to sign in. We mean it.',
  },
  {
    q: 'Will this work for trips within India — trains, domestic flights, Tier 2 cities?',
    a: 'Yes. TravelMate works for any trip, anywhere in India or the world. Users plan Manali road trips, Kerala backwaters, and IRCTC train journeys — all with the same AI companion.',
  },
  {
    q: 'Can my whole group use this together?',
    a: 'Absolutely. Invite friends with owner, editor, or viewer roles. Changes sync in real time and an activity feed tracks who did what. The budget split handles even complex group splits automatically.',
  },
  {
    q: 'Is my personal travel data safe?',
    a: 'All data is stored with Row-Level Security enforced at the database level — you can only ever read or modify your own trips. We never sell your data to airlines, hotels, or advertisers.',
  },
  {
    q: 'Does it work offline?',
    a: "Yes. TravelMate is a Progressive Web App with a service worker that caches your trip data. You can install it on your phone's home screen and access core features without internet.",
  },
  {
    q: 'Can I export my trip data?',
    a: 'Yes. The Export module generates a PDF of your full itinerary, budget summary, and expense log — ready to share or print before you travel.',
  },
  {
    q: 'How do I install it on my phone?',
    a: 'Open TravelMate in Chrome on your phone, tap the menu and select "Add to Home Screen". The app installs with a native-app experience and works offline.',
  },
] as const;

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="faq"
      className="py-20"
      style={{ background: '#FAFAF7' }}
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto max-w-2xl px-5">
        <div className="mb-12 text-center">
          <h2 className="text-[32px] font-bold tracking-tight text-gray-900 sm:text-[40px]">
            Common questions
          </h2>
        </div>

        <dl className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-sm"
                style={{ border: '1px solid #E5E7EB' }}
              >
                <dt>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    style={{ minHeight: 56 }}
                  >
                    <span className="text-[15px] font-semibold text-gray-900">{item.q}</span>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.dd
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`faq-question-${i}`}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? {} : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        className="px-5 pb-5 text-[14px] leading-relaxed text-gray-500"
                        style={{ borderTop: '1px solid #F3F4F6' }}
                      >
                        {item.a}
                      </p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
