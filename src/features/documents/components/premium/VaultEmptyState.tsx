import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, FADE_VARIANTS, CARD_VARIANTS } from '@/lib/motion';

interface Props {
  onUploadClick: () => void;
}

export function VaultEmptyState({ onUploadClick }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-8 py-20 text-center"
    >
      {/* Layered vault icon */}
      <motion.div
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/40 bg-card/60 shadow-xl backdrop-blur-sm">
          <div className="bg-gradient-premium flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full border border-border/60 bg-card/80" />
        <div className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full border border-border/60 bg-card/80" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Your vault is empty</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Upload passports, visas, tickets, insurance and all your essential travel documents — all
          in one secure place.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button
          onClick={onUploadClick}
          className="bg-gradient-premium gap-2 text-white hover:opacity-90"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload your first document
        </Button>
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Passport', 'Visa', 'Flights', 'Insurance', 'Vaccination'].map((label) => (
          <span
            key={label}
            className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
