import { supabase } from '@/lib/supabase';
import type { TripInvitationRow, InvitationDetails, TripMemberRole } from '../types';
import type { Database } from '@/types/database.types';

type InvitationRow = Database['public']['Functions']['get_invitation_by_token']['Returns'][number];

export async function getInvitations(tripId: string): Promise<TripInvitationRow[]> {
  const { data, error } = await supabase
    .from('trip_invitations')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createInvitation(
  tripId: string,
  invitedEmail: string,
  role: TripMemberRole,
  invitedBy: string,
): Promise<TripInvitationRow> {
  const { data, error } = await supabase
    .from('trip_invitations')
    .insert({
      trip_id: tripId,
      invited_by: invitedBy,
      invited_email: invitedEmail.toLowerCase().trim(),
      role,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase.from('trip_invitations').delete().eq('id', invitationId);
  if (error) throw new Error(error.message);
}

/** Public: reads invitation details via secure token (no auth required) */
export async function getInvitationByToken(token: string): Promise<InvitationDetails | null> {
  const { data, error } = await supabase.rpc('get_invitation_by_token', { p_token: token });
  if (error) throw new Error(error.message);
  const rows = data as InvitationRow[] | null;
  const row = rows?.[0];
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    invitedEmail: row.invited_email,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    tripTitle: row.trip_title,
    tripDestination: row.trip_destination,
    invitedByName: row.invited_by_name,
  };
}

/** Accepts an invitation. Returns the trip ID on success. Requires auth. */
export async function acceptInvitation(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_invitation', { p_token: token });
  if (error) throw new Error(error.message);
  return data;
}

/** Declines an invitation. */
export async function declineInvitation(token: string): Promise<void> {
  const { error } = await supabase.rpc('decline_invitation', { p_token: token });
  if (error) throw new Error(error.message);
}
