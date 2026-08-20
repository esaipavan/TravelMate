import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2, ArrowRight, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { APP_NAME } from '@/utils/constants';
import { createTrip } from '@/features/trips/services/trips.service';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import type { OnboardingDates } from '../types';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;
const today = format(new Date(), 'yyyy-MM-dd');
const defaultEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');

interface CreateTripStepProps {
  destination: string;
  dates: OnboardingDates | null;
  userId: string;
  onDone: (tripId: string) => void;
  onSkipTrip: () => void;
  reduced: boolean;
}

export function CreateTripStep({
  destination,
  dates,
  userId,
  onDone,
  onSkipTrip,
  reduced,
}: CreateTripStepProps) {
  const [title, setTitle] = useState(`${destination} Adventure`);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const from = dates?.from ?? today;
      const to = dates?.to ?? defaultEnd;
      const coverImageUrl = await selectTripCoverImage(destination);
      const trip = await createTrip({
        user_id: userId,
        title: title.trim(),
        destination,
        start_date: from,
        end_date: to,
        currency,
        total_budget: budget ? parseFloat(budget) : null,
        status: 'planning',
        is_public: false,
        notes: `Created during ${APP_NAME} onboarding`,
        cover_image_url: coverImageUrl,
      });
      setStatus('done');
      setTimeout(() => onDone(trip.id), 900);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Your trip will still be saved after onboarding.');
    }
  }

  if (status === 'done') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <motion.div
          initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}
        >
          <Check className="h-12 w-12 text-emerald-400" aria-hidden="true" />
        </motion.div>
        <p className="mt-6 text-[18px] font-bold text-white">Trip created!</p>
        <p className="mt-1 text-[13px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Preparing your dashboard…
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        void handleCreate(e);
      }}
      className="flex flex-1 flex-col px-5"
      noValidate
    >
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <h2 className="text-[26px] font-black tracking-tight text-white">Create your trip</h2>
        <p className="mt-1 text-[14px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Review the details — you can edit everything later.
        </p>
      </motion.div>

      <div className="flex flex-1 flex-col gap-4">
        <div>
          <label
            htmlFor="trip-title"
            className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
          >
            Trip name
          </label>
          <input
            id="trip-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            required
            aria-label="Trip name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40">
            Destination
          </label>
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] text-white/60"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <MapPin className="h-4 w-4 text-white/30" aria-hidden="true" />
            {destination}
          </div>
        </div>

        {dates && (
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40">
              Dates
            </label>
            <div
              className="rounded-xl px-4 py-3 text-[14px] text-white/60"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {dates.from} → {dates.to}
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="budget"
            className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
          >
            Budget <span className="font-normal normal-case text-white/25">(optional)</span>
          </label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-xl px-3 py-3 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Budget currency"
            >
              {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'THB'].map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>
                  {c}
                </option>
              ))}
            </select>
            <input
              id="budget"
              type="number"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 30000"
              className="flex-1 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Budget amount"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <p role="alert" className="mt-2 text-[13px] text-amber-400">
          {errorMsg}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="submit"
          disabled={status === 'loading' || !title.trim()}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'text-[15px] font-bold text-white transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            status === 'loading' || !title.trim()
              ? 'cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5',
          ].join(' ')}
          style={status !== 'loading' && title.trim() ? {} : { background: 'rgba(99,102,241,0.3)' }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Creating your trip…
            </>
          ) : (
            <>
              Create Trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onSkipTrip}
          className="py-2 text-[13px] text-white/35 transition-colors hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          I&apos;ll set up my trip later
        </button>
      </div>
    </form>
  );
}
