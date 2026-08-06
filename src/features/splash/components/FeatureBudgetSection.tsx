import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

export function FeatureBudgetSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  const leftAnim = reduced
    ? {}
    : { initial: { opacity: 0, x: -28 }, animate: inView ? { opacity: 1, x: 0 } : {} };
  const rightAnim = reduced
    ? {}
    : { initial: { opacity: 0, x: 28 }, animate: inView ? { opacity: 1, x: 0 } : {} };

  return (
    <section
      className="py-20"
      style={{ background: '#F3F4F6' }}
      aria-label="Budget & Expenses feature"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div ref={ref} className="flex flex-col items-center gap-14 lg:flex-row-reverse lg:gap-20">
          {/* Right: copy */}
          <motion.div
            className="flex-1"
            {...rightAnim}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="mb-4 inline-block rounded-full px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider"
              style={{ background: '#FEF3C7', color: '#92400E' }}
            >
              Budget &amp; Expenses
            </span>
            <h2 className="mb-4 text-[32px] font-bold leading-[1.2] tracking-tight text-gray-900 sm:text-[40px]">
              Never argue about money after the trip.
            </h2>
            <p className="mb-7 text-[17px] leading-[1.65] text-gray-500">
              Track every rupee, auto-split group expenses, and get budget alerts before you
              overspend. Built for how Indian groups actually travel.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                '30+ currencies with live exchange rates',
                'Smart group split — fair even when amounts differ',
                'Per-category budget alerts before you overspend',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: '#FEF3C7' }}
                    aria-hidden="true"
                  >
                    <Check className="h-3 w-3 text-amber-700" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-amber-700 transition-colors hover:text-amber-900"
            >
              Start tracking for free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Left: expense card mockup */}
          <motion.div
            className="w-full max-w-sm flex-shrink-0"
            {...leftAnim}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{
                boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #F3F4F6' }}
              >
                <div>
                  <p className="text-[12px] text-gray-400">Goa Trip — Group Expenses</p>
                  <p className="text-[20px] font-bold text-gray-900">₹ 48,300</p>
                </div>
                <span
                  className="rounded-lg px-3 py-1.5 text-[12px] font-semibold"
                  style={{ background: '#FEF3C7', color: '#92400E' }}
                >
                  3 people
                </span>
              </div>

              {/* Expense rows */}
              <div className="divide-y divide-gray-50 px-5">
                {[
                  { name: 'Priya', action: 'paid for Villa', amount: '₹ 12,000', color: '#6366F1' },
                  { name: 'Arjun', action: 'paid for Food', amount: '₹ 8,500', color: '#10B981' },
                  {
                    name: 'You',
                    action: 'paid for Activities',
                    amount: '₹ 6,200',
                    color: '#F59E0B',
                  },
                ].map(({ name, action, amount, color }) => (
                  <div key={name} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                        style={{ background: color }}
                      >
                        {name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{name}</p>
                        <p className="text-[11px] text-gray-400">{action}</p>
                      </div>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-700">{amount}</p>
                  </div>
                ))}
              </div>

              {/* Settlement */}
              <div
                className="mx-4 mb-4 mt-2 rounded-xl px-4 py-3"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-green-700">
                  Settlement
                </p>
                <p className="text-[12px] text-green-800">
                  Arjun owes you <span className="font-bold">₹ 1,850</span>
                </p>
                <p className="text-[12px] text-green-800">
                  Priya owes Arjun <span className="font-bold">₹ 3,100</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
