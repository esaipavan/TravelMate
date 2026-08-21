// Shared helpers for the ai-chat providers.

/**
 * fetch() with a hard timeout. Providers have no built-in deadline, so a
 * provider whose endpoint accepts the connection but never responds would
 * otherwise hang the whole Edge Function (and every fallback after it) until
 * the client aborts. An AbortController bounds each attempt so a slow/stalled
 * provider fails fast and the fallback chain can move on to the next one.
 *
 * On timeout the underlying fetch rejects with an AbortError; callers convert
 * that into a clear, provider-named error message.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 12_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** True when an error is the AbortError thrown by fetchWithTimeout on timeout. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError';
}
