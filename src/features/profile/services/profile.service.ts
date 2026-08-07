import { supabase } from '@/lib/supabase';
import type { ProfileRow, ProfileUpdate } from '../types';

const AVATAR_BUCKET = 'profile-images';
const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Profile CRUD ──────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ProfileRow> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(userId: string, update: ProfileUpdate): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Avatar storage ────────────────────────────────────────────────────────────

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, or WebP images are allowed.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // append a timestamp so the browser doesn't serve a stale cached image
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removeAvatar(avatarUrl: string): Promise<void> {
  const marker = `/object/public/${AVATAR_BUCKET}/`;
  const idx = avatarUrl.indexOf(marker);
  if (idx === -1) return;
  const path = avatarUrl.split('?')[0].slice(idx + marker.length);
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

export async function deleteUserFiles(userId: string): Promise<void> {
  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  if (files?.length) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from(AVATAR_BUCKET).remove(paths);
  }
}

// ── Data export ───────────────────────────────────────────────────────────────

export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const [
    profileResult,
    tripsResult,
    expensesResult,
    journalResult,
    documentsResult,
    remindersResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('trips').select('*').eq('user_id', userId),
    supabase.from('expenses').select('*').eq('user_id', userId),
    supabase.from('journal_entries').select('*').eq('user_id', userId),
    supabase.from('travel_documents').select('*').eq('user_id', userId),
    supabase.from('reminders').select('*').eq('user_id', userId),
  ]);

  return {
    exported_at: new Date().toISOString(),
    profile: profileResult.data,
    trips: tripsResult.data ?? [],
    expenses: expensesResult.data ?? [],
    journal_entries: journalResult.data ?? [],
    documents: documentsResult.data ?? [],
    reminders: remindersResult.data ?? [],
  };
}
