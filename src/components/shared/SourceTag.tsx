import { BadgeCheck, Sparkles, Calculator, CircleDashed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The four information-source classes shown anywhere TravelMate surfaces a
 * fact next to the user — never let AI-generated content look identical to a
 * verified one. See CLAUDE.md / Place Intelligence architecture:
 *   - verified: from a trusted provider (geocoder, Wikipedia article that
 *     already passed its India/geographic gates, weather API, Geoapify).
 *   - derived: computed from the app's own data (distance, trip countdown,
 *     budget math) — not an external claim, so no confidence bar to meet.
 *   - ai: chatWithAI output. Always labelled; never presented as fact.
 *   - unknown: nothing available for this field. Shown explicitly rather than
 *     silently omitted or guessed.
 */
export type SourceKind = 'verified' | 'derived' | 'ai' | 'unknown';

const META: Record<SourceKind, { label: string; icon: LucideIcon; className: string }> = {
  verified: {
    label: 'Verified',
    icon: BadgeCheck,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  derived: {
    label: 'Estimated',
    icon: Calculator,
    className: 'text-muted-foreground',
  },
  ai: {
    label: 'AI Advisory',
    icon: Sparkles,
    className: 'text-primary',
  },
  unknown: {
    label: 'Not verified for this location',
    icon: CircleDashed,
    className: 'text-muted-foreground/70',
  },
};

interface Props {
  kind: SourceKind;
  /** Override the default label text (e.g. "AI suggestion" instead of "AI Advisory"). */
  label?: string;
  className?: string;
}

/** Small, subtle inline source indicator — deliberately quiet (no pill/border
 *  by default) so it reads as a caption, not a decoration. */
export function SourceTag({ kind, label, className }: Props) {
  const meta = META[kind];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide',
        meta.className,
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {label ?? meta.label}
    </span>
  );
}

/** Convenience wrapper for a labelled fact row whose value is not currently
 *  verifiable — renders the field label plus the explicit "Not verified"
 *  state, so a missing fact is always shown honestly rather than omitted. */
export function UnknownField({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-2 text-xs', className)}>
      <span className="text-muted-foreground">{label}</span>
      <SourceTag kind="unknown" />
    </div>
  );
}
