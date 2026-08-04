import { supabase } from '@/lib/supabase';

// ── Active user counts (DAU / WAU / MAU) ─────────────────────────────────────

export interface ActiveUserCounts {
  dau: number;
  wau: number;
  mau: number;
}

export async function getActiveUserCounts(): Promise<ActiveUserCounts> {
  const { data, error } = await supabase.rpc('get_active_user_counts');
  if (error) throw error;
  const row = (data as ActiveUserCounts[] | null)?.[0];
  return { dau: Number(row?.dau ?? 0), wau: Number(row?.wau ?? 0), mau: Number(row?.mau ?? 0) };
}

// ── 30-day DAU trend ─────────────────────────────────────────────────────────

export interface DauPoint {
  date: string;
  dau: number;
}

export async function getDauTrend(daysBack = 30): Promise<DauPoint[]> {
  const { data, error } = await supabase.rpc('get_dau_trend', { days_back: daysBack });
  if (error) throw error;
  return ((data as { trend_date: string; dau: number }[]) ?? []).map((r) => ({
    date: r.trend_date,
    dau: Number(r.dau),
  }));
}

// ── Activation rate ───────────────────────────────────────────────────────────

export async function getActivationRate(): Promise<number> {
  const { data, error } = await supabase.rpc('get_activation_rate');
  if (error) throw error;
  return Number(data ?? 0);
}

// ── Retention ─────────────────────────────────────────────────────────────────

export interface RetentionMetrics {
  day7Pct: number;
  day30Pct: number;
}

export async function getRetention(): Promise<RetentionMetrics> {
  const { data, error } = await supabase.rpc('get_retention');
  if (error) throw error;
  const row = (data as { day7_pct: number; day30_pct: number }[] | null)?.[0];
  return { day7Pct: Number(row?.day7_pct ?? 0), day30Pct: Number(row?.day30_pct ?? 0) };
}

// ── User funnel ───────────────────────────────────────────────────────────────

export interface FunnelStep {
  step: string;
  userCount: number;
}

const FUNNEL_LABELS: Record<string, string> = {
  registered: 'Registered',
  onboarding_completed: 'Onboarding Done',
  trip_created: 'Trip Created',
  feature_engaged: 'Feature Engaged',
  active_last_7d: 'Active (7d)',
};

export async function getFunnelCounts(): Promise<FunnelStep[]> {
  const { data, error } = await supabase.rpc('get_funnel_counts');
  if (error) throw error;
  return ((data as { step: string; user_count: number }[]) ?? []).map((r) => ({
    step: FUNNEL_LABELS[r.step] ?? r.step,
    userCount: Number(r.user_count),
  }));
}

// ── AI summary ────────────────────────────────────────────────────────────────

export interface AiSummary {
  totalCalls: number;
  callsToday: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  avgLatencyMs: number;
  successRate: number;
}

export async function getAiSummary(): Promise<AiSummary> {
  const { data, error } = await supabase.rpc('get_ai_summary');
  if (error) throw error;
  const row = (
    data as
      | {
          total_calls: number;
          calls_today: number;
          total_prompt_tokens: number;
          total_completion_tokens: number;
          avg_latency_ms: number;
          success_rate: number;
        }[]
      | null
  )?.[0];
  return {
    totalCalls: Number(row?.total_calls ?? 0),
    callsToday: Number(row?.calls_today ?? 0),
    totalPromptTokens: Number(row?.total_prompt_tokens ?? 0),
    totalCompletionTokens: Number(row?.total_completion_tokens ?? 0),
    avgLatencyMs: Number(row?.avg_latency_ms ?? 0),
    successRate: Number(row?.success_rate ?? 0),
  };
}

// ── Top destinations ──────────────────────────────────────────────────────────

export interface DestinationRow {
  destination: string;
  countryCode: string | null;
  tripCount: number;
}

export async function getTopDestinations(lim = 10): Promise<DestinationRow[]> {
  const { data, error } = await supabase.rpc('get_top_destinations', { lim });
  if (error) throw error;
  return (
    (data as { destination: string; country_code: string | null; trip_count: number }[]) ?? []
  ).map((r) => ({
    destination: r.destination,
    countryCode: r.country_code,
    tripCount: Number(r.trip_count),
  }));
}

// ── Device / browser breakdown ────────────────────────────────────────────────

export interface DeviceRow {
  deviceType: string;
  browser: string;
  userCount: number;
}

export async function getDeviceBreakdown(): Promise<DeviceRow[]> {
  const { data, error } = await supabase.rpc('get_device_breakdown');
  if (error) throw error;
  return ((data as { device_type: string; browser: string; user_count: number }[]) ?? []).map(
    (r) => ({
      deviceType: r.device_type,
      browser: r.browser,
      userCount: Number(r.user_count),
    }),
  );
}

// ── Feature adoption v2 ───────────────────────────────────────────────────────

export interface FeatureAdoptionV2 {
  feature: string;
  adopters: number;
  totalUsers: number;
  pct: number;
}

export async function getFeatureAdoptionV2(): Promise<FeatureAdoptionV2[]> {
  const { data, error } = await supabase.rpc('get_feature_adoption_v2');
  if (error) throw error;
  return (
    (data as { feature: string; adopters: number; total_users: number; pct: number }[]) ?? []
  ).map((r) => ({
    feature: r.feature,
    adopters: Number(r.adopters),
    totalUsers: Number(r.total_users),
    pct: Number(r.pct),
  }));
}
