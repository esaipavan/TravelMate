import { describe, it, expect, beforeAll } from 'vitest';
import { getTripStatus, getTripProgress } from './tripStatus';

// TravelMate is India-focused (CLAUDE.md), and the bug these tests guard
// against is specifically a UTC-vs-local-midnight boundary issue. Forcing
// the process timezone makes Date's local getters (which getTripStatus /
// getTripProgress rely on) behave the same in CI as they do for a real
// India-based user, instead of depending on whichever timezone happens to
// run the test suite.
beforeAll(() => {
  process.env.TZ = 'Asia/Kolkata';
});

function trip(start: string, end: string, status: 'planning' | 'cancelled' = 'planning') {
  return { start_date: start, end_date: end, status };
}

// A fixed "now" comfortably clear of any UTC-boundary edge, for tests that
// aren't specifically about that edge.
const NOON = new Date(2026, 5, 15, 12, 0, 0); // 2026-06-15 12:00 local

describe('getTripStatus', () => {
  it('trip starting today is active', () => {
    expect(getTripStatus(trip('2026-06-15', '2026-06-20'), NOON)).toBe('active');
  });

  it('trip starting tomorrow is upcoming', () => {
    expect(getTripStatus(trip('2026-06-16', '2026-06-20'), NOON)).toBe('upcoming');
  });

  it('trip that ended yesterday is completed', () => {
    expect(getTripStatus(trip('2026-06-10', '2026-06-14'), NOON)).toBe('completed');
  });

  it('trip starting in the future is upcoming', () => {
    expect(getTripStatus(trip('2026-07-01', '2026-07-05'), NOON)).toBe('upcoming');
  });

  it('trip ending today is active', () => {
    expect(getTripStatus(trip('2026-06-10', '2026-06-15'), NOON)).toBe('active');
  });

  it('a same-day trip today is active', () => {
    expect(getTripStatus(trip('2026-06-15', '2026-06-15'), NOON)).toBe('active');
  });

  it('a same-day trip in the future is upcoming', () => {
    expect(getTripStatus(trip('2026-06-16', '2026-06-16'), NOON)).toBe('upcoming');
  });

  it('a same-day trip in the past is completed', () => {
    expect(getTripStatus(trip('2026-06-14', '2026-06-14'), NOON)).toBe('completed');
  });

  it('boundary: start_date exactly equal to today is active, not upcoming', () => {
    expect(getTripStatus(trip('2026-06-15', '2026-06-20'), NOON)).toBe('active');
  });

  it('boundary: end_date exactly equal to today is active, not completed', () => {
    expect(getTripStatus(trip('2026-06-01', '2026-06-15'), NOON)).toBe('active');
  });

  it('cancelled overrides date-based status even mid-trip', () => {
    expect(getTripStatus(trip('2026-06-01', '2026-06-30', 'cancelled'), NOON)).toBe('cancelled');
  });

  it('derives "today" from local time, not UTC, around local midnight', () => {
    // 2026-06-15 00:30 IST is 2026-06-14 19:00 UTC — exactly the boundary the
    // original toISOString()-based bug got wrong. A trip starting today
    // (local) must already read as active, not upcoming; a trip that ended
    // yesterday (local) must already read as completed.
    const justAfterLocalMidnight = new Date(2026, 5, 15, 0, 30, 0);
    expect(getTripStatus(trip('2026-06-15', '2026-06-20'), justAfterLocalMidnight)).toBe('active');
    expect(getTripStatus(trip('2026-06-10', '2026-06-14'), justAfterLocalMidnight)).toBe(
      'completed',
    );
  });
});

describe('getTripProgress', () => {
  it('future trip is 0%', () => {
    expect(getTripProgress(trip('2026-07-01', '2026-07-05'), NOON).percent).toBe(0);
  });

  it('completed trip is 100%', () => {
    expect(getTripProgress(trip('2026-06-01', '2026-06-05'), NOON).percent).toBe(100);
  });

  it('same-day trip today is 100%', () => {
    const p = getTripProgress(trip('2026-06-15', '2026-06-15'), NOON);
    expect(p.percent).toBe(100);
    expect(p.totalDays).toBe(1);
    expect(p.dayNumber).toBe(1);
  });

  it('reaches exactly 100% on the final day of a multi-day trip', () => {
    // Regression: the old (daysPassed / totalDays) formula gave 67% here,
    // not 100%, because daysPassed is 0-based against an inclusive duration.
    const p = getTripProgress(trip('2026-06-13', '2026-06-15'), NOON);
    expect(p.totalDays).toBe(3);
    expect(p.dayNumber).toBe(3);
    expect(p.percent).toBe(100);
  });

  it('first day of a multi-day trip represents its beginning, not 0%', () => {
    const p = getTripProgress(trip('2026-06-15', '2026-06-17'), NOON);
    expect(p.dayNumber).toBe(1);
    expect(p.percent).toBeGreaterThan(0);
  });

  it('daysLeft counts down to 0 on the last day', () => {
    expect(getTripProgress(trip('2026-06-13', '2026-06-15'), NOON).daysLeft).toBe(0);
    expect(getTripProgress(trip('2026-06-13', '2026-06-17'), NOON).daysLeft).toBe(2);
  });

  it('is never negative and never exceeds 100, far in the past or future', () => {
    const wayPast = getTripProgress(trip('2020-01-01', '2020-01-10'), NOON).percent;
    const wayFuture = getTripProgress(trip('2099-01-01', '2099-01-10'), NOON).percent;
    expect(wayPast).toBe(100);
    expect(wayFuture).toBe(0);
    for (const p of [wayPast, wayFuture]) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});
