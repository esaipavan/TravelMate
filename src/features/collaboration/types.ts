import type { Database } from '@/types/database.types';

export type TripMemberRole = Database['public']['Enums']['trip_member_role'];
export type InvitationStatus = Database['public']['Enums']['invitation_status'];

export type TripMemberRow = Database['public']['Tables']['trip_members']['Row'];
export type TripInvitationRow = Database['public']['Tables']['trip_invitations']['Row'];
export type TripActivityLogRow = Database['public']['Tables']['trip_activity_logs']['Row'];

// Extended member row that joins profile data
export interface CollabMember {
  id: string;
  tripId: string;
  userId: string;
  role: TripMemberRole | 'owner';
  isOwner: boolean;
  joinedAt: string;
  invitedBy: string | null;
  // From profiles join
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

// Invitation with trip context for the share page
export interface InvitationDetails {
  id: string;
  tripId: string;
  invitedEmail: string;
  role: TripMemberRole;
  status: InvitationStatus;
  expiresAt: string;
  tripTitle: string;
  tripDestination: string;
  invitedByName: string | null;
}

// Activity log entry enriched with actor profile data
export interface ActivityEntry {
  id: string;
  tripId: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  // From profiles join (may be null if user deleted their account)
  actorName: string | null;
  actorAvatarUrl: string | null;
  actorInitials: string | null;
}

export type EffectiveRole = 'owner' | 'editor' | 'viewer' | null;
