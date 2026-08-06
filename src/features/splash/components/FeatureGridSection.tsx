import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Sparkles, MapPin, Wallet, BookOpen, FileText, Cloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface GridCard {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const CARDS: GridCard[] = [
  {
    icon: Sparkles,
    title: 'AI Concierge',
    desc: 'Morning briefs, packing, safety, budget — all automated and tailored to your trip.',
    accent: '#6366F1',
  },
  {
    icon: MapPin,
    title: 'Trip Itinerary',
    desc: 'Day-by-day planning with drag-and-drop reordering and real-time collaboration.',
    accent: '#10B981',
  },
  {
    icon: Wallet,
    title: 'Group Budget',
    desc: 'Track expenses, split fairly, settle in any currency. Built for Indian group travel.',
    accent: '#F59E0B',
  },
  {
    icon: BookOpen,
    title: 'Travel Journal',
    desc: 'Write trip memories; AI helps you turn bullet points into stories worth keeping.',
    accent: '#EC4899',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    desc: 'Passports, visas, insurance — all in one encrypted place with expiry reminders.',
    accent: '#F97316',
  },
  {
    icon: Cloud,
    title: 'Destination Intel',
    desc: 'Weather, safety alerts, local tips, and nearby places — before you even land.',
    accent: '#0EA5E9',
  },
];

export function FeatureGridSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="py-20" style={{ background: '#FAFAF7' }} aria-label="All features">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-gray-100 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
            Everything included
          </span>
          <h2 className="text-[32px] font-bold tracking-tight text-gray-900 sm:text-[40px]">
            One app for your entire trip
          </h2>
        </div>

        <div
          ref={ref}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Feature list"
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: card.accent + '15' }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.accent }} aria-hidden="true" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-bold text-gray-900">{card.title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-500">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
