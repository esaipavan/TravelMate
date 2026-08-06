import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Download, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Your data is encrypted end-to-end.',
    body: 'Only you can see your trips. We use Row-Level Security enforced at the database level — even our team cannot read your data.',
  },
  {
    icon: EyeOff,
    title: 'We never sell your data.',
    body: 'Your travel plans, expenses, and documents are never shared with airlines, hotels, or advertisers. Ever. No exceptions.',
  },
  {
    icon: Download,
    title: 'Export or delete anytime.',
    body: 'Download all your data as a PDF or delete your account in one tap. No lock-in, no waiting, no questions asked.',
  },
];

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="py-20"
      style={{ background: '#0F2A6E' }}
      aria-label="Privacy and security"
      id="security"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <span
            className="mb-3 inline-block rounded-full px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-200"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            Security & Privacy
          </span>
          <h2 className="mb-3 text-[28px] font-bold tracking-tight text-white sm:text-[36px]">
            Your data stays yours.
          </h2>
          <p className="text-[16px] text-blue-200">
            Built the way we'd want our own travel app to work.
          </p>
        </div>

        <div
          ref={ref}
          className="grid gap-6 sm:grid-cols-3"
          role="list"
          aria-label="Security guarantees"
        >
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                role="listitem"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-blue-200" />
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-white">{card.title}</h3>
                <p className="text-[14px] leading-relaxed text-blue-200">{card.body}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-200 transition-colors hover:text-white"
          >
            Read our full privacy policy
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
