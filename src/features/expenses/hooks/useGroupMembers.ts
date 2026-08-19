/**
 * Bridge hook: maps the collaboration feature's CollabMember shape
 * to the TripMember interface expected by the expenses feature.
 * Replaces the previous localStorage-only implementation.
 */
import { useTripMembers } from '@/features/collaboration/hooks/useTripMembers';
import type { CollabMember } from '@/features/collaboration/types';
import type { TripMember, MemberRole } from '../utils/settlement';

export type { TripMember, MemberRole };

function toTripMember(m: CollabMember): TripMember {
  const role: MemberRole = m.role === 'owner' ? 'owner' : m.role === 'editor' ? 'editor' : 'viewer';
  return {
    id: m.userId,
    name: m.name,
    email: m.email,
    initials: m.initials,
    role,
    isOwner: m.isOwner,
    avatarUrl: m.avatarUrl,
  };
}

interface UseGroupMembersResult {
  members: TripMember[];
  ownerMemberId: string;
  isLoading: boolean;
}

export function useGroupMembers(tripId: string): UseGroupMembersResult {
  const { data: collabMembers = [], isLoading } = useTripMembers(tripId);

  const ownerId = collabMembers.find((m) => m.isOwner)?.userId ?? '';
  const members: TripMember[] = collabMembers.map(toTripMember);

  return {
    members,
    ownerMemberId: ownerId,
    isLoading,
  };
}

export { useTripRole } from '@/features/collaboration/hooks/useTripRole';
export type { EffectiveRole } from '@/features/collaboration/types';
