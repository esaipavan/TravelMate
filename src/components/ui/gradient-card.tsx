import * as React from 'react';
import { cn } from '@/lib/utils';

export type GradientPreset = 'brand' | 'warm' | 'ocean' | 'forest' | 'sunset';

const GRADIENT_PRESETS: Record<GradientPreset, string> = {
  brand: 'from-primary to-accent',
  warm: 'from-orange-400 to-rose-500',
  ocean: 'from-sky-400 to-blue-600',
  forest: 'from-emerald-400 to-cyan-500',
  sunset: 'from-rose-500 to-orange-400',
};

export interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: GradientPreset;
  /** Override with custom inline gradient style */
  gradientStyle?: string;
  /** Foreground text/content color, defaults to white */
  light?: boolean;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    { className, gradient = 'brand', gradientStyle, light = false, children, style, ...props },
    ref,
  ) => {
    const bgStyle = gradientStyle ? { background: gradientStyle, ...style } : style;

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl shadow-float',
          !gradientStyle && `bg-gradient-to-br ${GRADIENT_PRESETS[gradient]}`,
          light ? 'text-foreground' : 'text-white',
          className,
        )}
        style={bgStyle}
        {...props}
      >
        {/* Subtle noise texture overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          }}
        />
        {children}
      </div>
    );
  },
);
GradientCard.displayName = 'GradientCard';

export { GradientCard };
