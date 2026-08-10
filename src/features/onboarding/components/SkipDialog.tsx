import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SkipDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipDialog({ onConfirm, onCancel }: SkipDialogProps) {
  const ref = useFocusTrap<HTMLDivElement>(true, onCancel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        tabIndex={-1}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative z-10 w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl"
        style={{ background: 'rgba(18,18,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 id="skip-title" className="mb-1.5 text-[18px] font-bold text-white">
          Skip setup?
        </h3>
        <p className="mb-6 text-[13px]" style={{ color: 'rgba(248,250,252,0.7)' }}>
          You can always come back and set up your first trip from the dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Continue setup
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{ background: 'rgba(99,102,241,0.5)' }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
