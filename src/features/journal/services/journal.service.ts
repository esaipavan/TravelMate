import { supabase } from '@/lib/supabase';
import type { JournalEntryRow, JournalEntryInsert, JournalEntryUpdate } from '../types';

const BUCKET = 'journal';

// ── Entries ──────────────────────────────────────────────────────────────────

export async function getJournalEntries(tripId: string): Promise<JournalEntryRow[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createJournalEntry(entry: JournalEntryInsert): Promise<JournalEntryRow> {
  const { data, error } = await supabase.from('journal_entries').insert(entry).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateJournalEntry(
  id: string,
  update: JournalEntryUpdate,
): Promise<JournalEntryRow> {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function uploadJournalImage(
  userId: string,
  entryId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${entryId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 31536000);
  if (signError) throw new Error(signError.message);
  return data.signedUrl;
}

export async function deleteJournalImages(urls: string[]): Promise<void> {
  if (!urls.length) return;
  const marker = `/object/sign/${BUCKET}/`;
  const paths = urls
    .map((url) => {
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length).split('?')[0] : '';
    })
    .filter(Boolean);
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}
