import type { Json } from '@/types/database.types';
import { supabase } from './supabase';

// ── Session management ───────────────────────────────────────────────────────

const SESSION_KEY = 'tm_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── Device / browser detection ───────────────────────────────────────────────

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua) && !/tablet|ipad/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (/opr|opera/i.test(ua)) return 'opera';
  if (/edge|edg/i.test(ua)) return 'edge';
  if (/chrome/i.test(ua)) return 'chrome';
  if (/firefox/i.test(ua)) return 'firefox';
  if (/safari/i.test(ua)) return 'safari';
  return 'other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'windows';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/i.test(ua)) return 'macos';
  if (/linux/i.test(ua)) return 'linux';
  return 'other';
}

// ── Identity ─────────────────────────────────────────────────────────────────

let _userId: string | null = null;

export function identify(userId: string | null): void {
  _userId = userId;
}

// ── Core track function ──────────────────────────────────────────────────────
// Fire-and-forget — never throws, never blocks the UI.

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!_userId) return; // only track authenticated users

  const payload = {
    user_id: _userId,
    session_id: getSessionId(),
    event,
    properties: (properties ?? {}) as Json,
    page_path: window.location.pathname,
    device_type: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
  };

  void supabase.from('analytics_events').insert(payload);
}
