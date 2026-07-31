import { supabase } from '@/lib/supabase';
import type { CollabMember, TripMemberRole } from '../types';

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

function buildInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => (w[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('');
}

function displayName(p: ProfileRow | undefined): string {
  if (!p) return 'Member';
  return p.full_name ?? p.email.split('@')[0] ?? 'Member';
}

/**
 * Returns all members of a trip, including the owner (from trips.user_id),
 * with profile data joined. Owner is always listed first.
 */
export async function getTripMembers(tripId: string): Promise<CollabMember[]> {
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', tripId)
    .single();
  if (tripError) throw new Error(tripError.message);

  const { data: memberRows, error: membersError } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true });
  if (membersError) throw new Error(membersError.message);

  const allUserIds = [trip.user_id, ...memberRows.map((m) => m.user_id)];

  const { data: rawProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .in('id', allUserIds);
  if (profilesError) throw new Error(profilesError.message);

  const profiles = (rawProfiles ?? []) as ProfileRow[];
  const profileMap = new Map<string, ProfileRow>(profiles.map((p) => [p.id, p]));

  const ownerProfile = profileMap.get(trip.user_id);
  const ownerName = displayName(ownerProfile);
  const ownerMember: CollabMember = {
    id: `owner-${trip.user_id}`,
    tripId,
    userId: trip.user_id,
    role: 'owner',
    isOwner: true,
    joinedAt: '',
    invitedBy: null,
    name: ownerName,
    email: ownerProfile?.email ?? '',
    avatarUrl: ownerProfile?.avatar_url ?? null,
    initials: buildInitials(ownerName),
  };

  const nonOwnerMembers: CollabMember[] = memberRows.map((m) => {
    const p = profileMap.get(m.user_id);
    const name = displayName(p);
    return {
      id: m.id,
      tripId,
      userId: m.user_id,
      role: m.role,
      isOwner: false,
      joinedAt: m.joined_at,
      invitedBy: m.invited_by,
      name,
      email: p?.email ?? '',
      avatarUrl: p?.avatar_url ?? null,
      initials: buildInitials(name),
    };
  });

  return [ownerMember, ...nonOwnerMembers];
}

export async function updateMemberRole(
  tripId: string,
  userId: string,
  role: TripMemberRole,
): Promise<void> {
  const { error } = await supabase
    .from('trip_members')
    .update({ role })
    .eq('trip_id', tripId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function removeMember(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function getEffectiveRole(tripId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_trip_member_role', { p_trip_id: tripId });
  if (error) throw new Error(error.message);
  return data;
}
