import { useEffect } from 'react';
import { reportError } from '@/lib/error-reporter';

/**
 * Mounts global error listeners for the lifetime of the application.
 *
 * Captures two categories of runtime failures:
 * 1. Uncaught synchronous errors (window error event)
 * 2. Unhandled Promise rejections (window unhandledrejection event)
 *
 * React component render errors are captured separately by ErrorBoundary
 * via componentDidCatch, which calls reportError directly.
 *
 * This component renders nothing — it exists only to register side effects
 * in a React-idiomatic way so it respects the component tree lifecycle.
 */
export function ErrorReporter() {
  useEffect(() => {
    // reportError is a no-op in development; guard here as well for clarity
    if (import.meta.env.DEV) return;

    function handleError(event: ErrorEvent) {
      const stack = event.error instanceof Error ? (event.error.stack ?? '') : '';
      reportError({
        title: event.message || 'Unhandled JavaScript Error',
        description: [
          event.message,
          `at ${event.filename ?? 'unknown'}:${event.lineno ?? '?'}:${event.colno ?? '?'}`,
          stack,
        ]
          .filter(Boolean)
          .join('\n'),
        severity: 'high',
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason: unknown = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? (reason.stack ?? '') : '';
      reportError({
        title: `Unhandled Promise Rejection: ${message.slice(0, 120)}`,
        description: [message, stack].filter(Boolean).join('\n'),
        severity: 'medium',
      });
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
