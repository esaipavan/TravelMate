import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative flex items-center">
          {startIcon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
              {startIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border bg-background text-sm',
              'ring-offset-background placeholder:text-muted-foreground',
              'transition-all duration-150 ease-out',
              'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-input',
              startIcon ? 'pl-10' : 'px-4',
              endIcon ? 'pr-10' : 'pr-4',
              'py-2.5',
              className,
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3 flex items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
              {endIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border bg-background px-4 py-2.5 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'transition-all duration-150 ease-out',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-input',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
