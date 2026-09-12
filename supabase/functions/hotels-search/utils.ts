// Shared helper for the hotels-search provider — same shape as
// ai-chat/utils.ts, duplicated rather than shared (no _shared/ module exists
// between Edge Functions in this repo yet, and this task doesn't introduce
// one).

/**
 * fetch() with a hard timeout. The upstream hotel API has no built-in
 * deadline, and this function makes TWO sequential upstream calls (resolve
 * location, then fetch listings) — an unbounded stall on either would hang
 * the whole request. An AbortController bounds each attempt so a slow/stalled
 * upstream fails fast with a clear, sanitized error instead of hanging until
 * the client's own timeout gives up.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 8_000,
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
