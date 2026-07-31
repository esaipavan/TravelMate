import { supabase } from '@/lib/supabase';
import type { ActivityEntry } from '../types';

function buildInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => (w[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('');
}

export async function getActivityFeed(tripId: string, limit = 30): Promise<ActivityEntry[]> {
  const { data: logs, error: logsError } = await supabase
    .from('trip_activity_logs')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (logsError) throw new Error(logsError.message);
  if (!logs || logs.length === 0) return [];

  // Fetch actor profiles in one query
  const actorIds = [
    ...new Set(logs.map((l) => l.user_id).filter((id): id is string => id !== null)),
  ];
  const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', actorIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url });
    }
  }

  return logs.map((log) => {
    const actor = log.user_id ? profileMap.get(log.user_id) : undefined;
    const actorName = actor?.full_name ?? null;
    return {
      id: log.id,
      tripId: log.trip_id,
      userId: log.user_id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      description: log.description,
      metadata: log.metadata,
      createdAt: log.created_at,
      actorName,
      actorAvatarUrl: actor?.avatar_url ?? null,
      actorInitials: actorName ? buildInitials(actorName) : null,
    };
  });
}

export async function logActivity(
  tripId: string,
  userId: string,
  action: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('trip_activity_logs').insert({
    trip_id: tripId,
    user_id: userId,
    action,
    description,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ?? {},
  });
  if (error) throw new Error(error.message);
}
