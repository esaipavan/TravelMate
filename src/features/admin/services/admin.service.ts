import { supabase } from '@/lib/supabase';

// ── Dashboard metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalUsers: number;
  tripsThisWeek: number;
  openBugs: number;
  pendingFeedback: number;
  aiCallsToday: number;
  activeFlags: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [usersRes, tripsRes, bugsRes, feedbackRes, aiRes, flagsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('trips').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']),
    supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('ai_usage_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    supabase
      .from('feature_flags')
      .select('id', { count: 'exact', head: true })
      .eq('is_enabled', true),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    tripsThisWeek: tripsRes.count ?? 0,
    openBugs: bugsRes.count ?? 0,
    pendingFeedback: feedbackRes.count ?? 0,
    aiCallsToday: aiRes.count ?? 0,
    activeFlags: flagsRes.count ?? 0,
  };
}

// ── User growth (last 30 days) ───────────────────────────────────────────────

export interface DailySignup {
  date: string;
  count: number;
}

export async function getUserGrowth(): Promise<DailySignup[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const d = row.created_at.slice(0, 10);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

// ── Feedback list ────────────────────────────────────────────────────────────

export interface FeedbackRow {
  id: string;
  user_id: string | null;
  type: string;
  subject: string;
  message: string;
  rating: number | null;
  page_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export async function getFeedbackList(status?: string): Promise<FeedbackRow[]> {
  let q = supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FeedbackRow[];
}

export async function updateFeedbackStatus(
  id: string,
  status: string,
  adminNotes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('feedback')
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq('id', id);
  if (error) throw error;
}

// ── Bug reports list ─────────────────────────────────────────────────────────

export interface BugReportRow {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  steps_to_reproduce: string | null;
  severity: string;
  status: string;
  browser_info: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBugReportList(
  status?: string,
  severity?: string,
): Promise<BugReportRow[]> {
  let q = supabase
    .from('bug_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') q = q.eq('status', status);
  if (severity && severity !== 'all') q = q.eq('severity', severity);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BugReportRow[];
}

export async function updateBugStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('bug_reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ── User list ────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  user_role: string;
  created_at: string;
  avatar_url: string | null;
}

export async function getUserList(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, username, user_role, created_at, avatar_url')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ user_role: role }).eq('id', userId);
  if (error) throw error;
}

// ── Feature adoption ─────────────────────────────────────────────────────────

export interface FeatureAdoption {
  feature: string;
  userCount: number;
  totalUsers: number;
}

export async function getFeatureAdoption(): Promise<FeatureAdoption[]> {
  const [usersRes, tripsRes, expRes, journalRes, reminderRes, docRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('trips').select('user_id').limit(1000),
    supabase.from('expenses').select('user_id').limit(1000),
    supabase.from('journal_entries').select('user_id').limit(1000),
    supabase.from('reminders').select('user_id').limit(1000),
    supabase.from('travel_documents').select('user_id').limit(1000),
  ]);

  const total = usersRes.count ?? 1;
  const uniq = (rows: { user_id: string }[] | null) =>
    new Set((rows ?? []).map((r) => r.user_id)).size;

  return [
    { feature: 'Trips', userCount: uniq(tripsRes.data), totalUsers: total },
    { feature: 'Expenses', userCount: uniq(expRes.data), totalUsers: total },
    { feature: 'Journal', userCount: uniq(journalRes.data), totalUsers: total },
    { feature: 'Reminders', userCount: uniq(reminderRes.data), totalUsers: total },
    { feature: 'Documents', userCount: uniq(docRes.data), totalUsers: total },
  ];
}
