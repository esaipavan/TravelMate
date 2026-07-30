/**
 * Error telemetry — extends the existing bug_reports table.
 *
 * Design constraints:
 * - No new dependencies: uses the existing supabase client and auth store.
 * - No React: callable from class components, event listeners, and async code.
 * - Never throws: errors inside the reporter are silently swallowed to
 *   prevent recursive failure loops.
 * - Rate-limited: the same error is reported at most once per 30 seconds to
 *   prevent flooding the bug_reports table during cascading failures.
 * - Production-only: in development, errors surface naturally in the console
 *   and DevTools rather than being silently swallowed into the database.
 */

import { supabase } from './supabase';
import { useAuthStore } from '@/store/auth.store';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  title: string;
  description: string;
  severity?: ErrorSeverity;
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

const DEDUP_WINDOW_MS = 30_000;
const MAX_DEDUP_KEYS = 50; // bounded to prevent unbounded memory growth

const recentKeys = new Map<string, number>();

function dedupKey(title: string, description: string): string {
  return `${title}::${description.slice(0, 150)}`;
}

function isRateLimited(key: string): boolean {
  const ts = recentKeys.get(key);
  return ts !== undefined && Date.now() - ts < DEDUP_WINDOW_MS;
}

function recordKey(key: string): void {
  if (recentKeys.size >= MAX_DEDUP_KEYS) {
    // Evict the oldest entry to keep memory bounded
    const firstEntry = recentKeys.keys().next();
    if (!firstEntry.done) recentKeys.delete(firstEntry.value);
  }
  recentKeys.set(key, Date.now());
}

// ─── Browser context ──────────────────────────────────────────────────────────

function collectBrowserInfo(): string {
  try {
    return JSON.stringify({
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return '{}';
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reports an error to the bug_reports table.
 *
 * This function is synchronous from the caller's perspective.
 * The actual database write is fire-and-forget.
 *
 * Safe to call from:
 * - React class component componentDidCatch
 * - window error event listeners
 * - Async catch blocks
 * - Anywhere in the application
 */
export function reportError(report: ErrorReport): void {
  if (import.meta.env.DEV) return;

  const key = dedupKey(report.title, report.description);
  if (isRateLimited(key)) return;
  recordKey(key);

  // Read auth state synchronously — Zustand getState() is safe outside React
  const userId = useAuthStore.getState().user?.id ?? null;
  const browserInfo = collectBrowserInfo();

  void (async () => {
    try {
      await supabase.from('bug_reports').insert({
        user_id: userId,
        title: report.title.slice(0, 200),
        description: report.description.slice(0, 2000),
        severity: report.severity ?? 'medium',
        status: 'open',
        browser_info: browserInfo,
      });
    } catch {
      // Intentionally silent — never let the reporter itself cause failures
    }
  })();
}
