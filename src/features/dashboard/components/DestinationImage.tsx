import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** Image URL, or null when the place isn't recognised — renders the honest
   *  colour/gradient treatment instead of a guessed photo. */
  src: string | null;
  alt: string;
  className?: string;
  fallbackAccent?: string;
}

export function DestinationImage({ src, alt, className, fallbackAccent = '#6366F1' }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn('absolute inset-0', className)}
        style={{
          background: `linear-gradient(135deg, ${fallbackAccent}45 0%, ${fallbackAccent}20 60%, ${fallbackAccent}08 100%)`,
        }}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <>
      {!loaded && (
        <div
          className={cn('absolute inset-0 animate-pulse bg-muted/80', className)}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}
