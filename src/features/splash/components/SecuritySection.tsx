import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const CARDS = [
  {
    icon: '🔒',
    title: 'Your data is encrypted end-to-end.',
    body: 'Only you can see your trips. We use Row-Level Security enforced at the database level.',
  },
  {
    icon: '👤',
    title: 'We never sell your data.',
    body: 'Your travel plans, expenses, and documents are never shared with airlines, hotels, or advertisers. Ever.',
  },
  {
    icon: '📤',
    title: 'Export or delete anytime.',
    body: 'Download all your data as a PDF or delete your account in one tap. No lock-in, no waiting.',
  },
];

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      className="py-20"
      style={{
        background: '#F0FDF4',
        borderTop: '1px solid #BBF7D0',
        borderBottom: '1px solid #BBF7D0',
      }}
      aria-label="Privacy and security"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[28px] font-bold tracking-tight text-gray-900 sm:text-[36px]">
            Your data stays yours.
          </h2>
          <p className="text-[16px] text-gray-500">
            We built TravelMate the way we'd want our own travel app to work.
          </p>
        </div>

        <div
          ref={ref}
          className="grid gap-6 sm:grid-cols-3"
          role="list"
          aria-label="Security guarantees"
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-white p-6"
              style={{ border: '1px solid #BBF7D0', boxShadow: '0 2px 12px rgba(16,185,129,0.06)' }}
            >
              <span className="mb-4 block text-3xl" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="mb-2 text-[16px] font-bold text-gray-900">{card.title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-500">{card.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-700 transition-colors hover:text-green-900"
          >
            Read our full privacy policy
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
