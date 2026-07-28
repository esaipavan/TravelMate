import type { Variants, Transition, TargetAndTransition } from 'framer-motion';

/* ── Easings ─────────────────────────────────────────────────────── */

export const EASE = {
  /** Smooth deceleration — best for elements entering the screen */
  out: [0.16, 1, 0.3, 1] as const,
  /** Smooth acceleration — best for elements leaving the screen */
  in: [0.4, 0, 1, 1] as const,
  /** Standard material ease — best for interactive feedback */
  inOut: [0.4, 0, 0.2, 1] as const,
} satisfies Record<string, readonly number[]>;

/* ── Springs ─────────────────────────────────────────────────────── */

export const SPRING = {
  /** Crisp card/button snap */
  snappy: { type: 'spring', damping: 20, stiffness: 300 } as Transition,
  /** Standard UI spring */
  normal: { type: 'spring', damping: 22, stiffness: 200 } as Transition,
  /** Relaxed — for large layout shifts */
  gentle: { type: 'spring', damping: 24, stiffness: 88 } as Transition,
  /** Modal entrance */
  modal: { type: 'spring', damping: 26, stiffness: 380 } as Transition,
} satisfies Record<string, Transition>;

/* ── Durations ───────────────────────────────────────────────────── */

export const DUR = {
  instant: 0,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  page: 0.32,
} as const;

/* ── Stagger factory ─────────────────────────────────────────────── */

export function stagger(children = 0.06, delay = 0.05): Transition {
  return { staggerChildren: children, delayChildren: delay };
}

/* ── Variant presets ─────────────────────────────────────────────── */

/** Page-level enter/exit — used in AppLayout & PublicLayout */
export const PAGE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.page, ease: EASE.out } },
  exit: { opacity: 0, y: -5, transition: { duration: DUR.fast, ease: EASE.in } },
};

/** Viewport-triggered section reveal */
export const SECTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
};

/** Spring card entrance */
export const CARD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING.normal } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DUR.fast } },
};

/** Dialog / modal */
export const MODAL_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING.modal } },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: DUR.fast, ease: EASE.in } },
};

/** Slide-in drawer (right side) */
export const DRAWER_VARIANTS: Variants = {
  hidden: { x: '100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: { ...SPRING.normal } },
  exit: { x: '100%', opacity: 0, transition: { duration: DUR.normal, ease: EASE.in } },
};

/** Stagger container — pair with LIST_ITEM_VARIANTS on children */
export const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: stagger(0.06, 0.08) },
};

/** Stagger list item */
export const LIST_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { ...SPRING.normal } },
};

/** Hero image/section — scale + fade */
export const HERO_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: EASE.out } },
};

/** Simple fade — overlays, tooltips, backdrops */
export const FADE_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.normal } },
  exit: { opacity: 0, transition: { duration: DUR.fast } },
};

/** Scale pop — chips, badges, small popups */
export const SCALE_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { ...SPRING.snappy } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: DUR.fast } },
};

/* ── Gesture presets ─────────────────────────────────────────────── */

export const HOVER = {
  /** Standard card lift */
  lift: { y: -3 } satisfies TargetAndTransition,
  /** Emphatic lift — for featured cards */
  liftLg: { y: -6, scale: 1.02 } satisfies TargetAndTransition,
  /** Scale-only — for icon buttons */
  scale: { scale: 1.08 } satisfies TargetAndTransition,
} as const;

export const PRESS = {
  /** Standard button press */
  normal: { scale: 0.96 } satisfies TargetAndTransition,
  /** Subtle press — for large cards */
  subtle: { scale: 0.98 } satisfies TargetAndTransition,
  /** Firm press — for icon buttons */
  small: { scale: 0.92 } satisfies TargetAndTransition,
} as const;

/* ── Loading animations ──────────────────────────────────────────── */

export const LOADING_PULSE: TargetAndTransition = {
  opacity: [1, 0.35, 1],
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
};

export const LOADING_DOT: TargetAndTransition = {
  opacity: [0.3, 1, 0.3],
  scale: [0.8, 1, 0.8],
  transition: { duration: 1, repeat: Infinity },
};

/* ── Reduced-motion helpers ──────────────────────────────────────── */

/**
 * Pass as `variants` when `useReducedMotion()` is true.
 * Every key resolves to an empty target — no movement, instant transitions.
 */
export const REDUCED_VARIANTS: Variants = { hidden: {}, show: {}, exit: {} };

/**
 * Returns `variants` when motion is allowed, `REDUCED_VARIANTS` when not.
 *
 * @example
 * const reduced = useReducedMotion();
 * <motion.div variants={rv(CARD_VARIANTS, reduced)} initial="hidden" animate="show" />
 */
export function rv(variants: Variants, reduced: boolean | null): Variants {
  return reduced ? REDUCED_VARIANTS : variants;
}

/**
 * Returns the gesture target when motion is allowed, `{}` when not.
 *
 * @example
 * const reduced = useReducedMotion();
 * <motion.button whileHover={rg(HOVER.lift, reduced)} whileTap={rg(PRESS.normal, reduced)} />
 */
export function rg(target: TargetAndTransition, reduced: boolean | null): TargetAndTransition {
  return reduced ? {} : target;
}
