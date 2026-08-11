import { supabase } from '@/lib/supabase';
import { ACCEPTED_TYPES } from '../types';
import type { TravelDocumentRow, TravelDocumentInsert, TravelDocumentUpdate } from '../types';

const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches MAX_FILE_SIZE in ../types.ts

const BUCKET = 'travel-documents';

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getDocuments(userId: string, tripId?: string): Promise<TravelDocumentRow[]> {
  const base = supabase
    .from('travel_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data, error } = await (tripId ? base.eq('trip_id', tripId) : base);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDocument(doc: TravelDocumentInsert): Promise<TravelDocumentRow> {
  const { data, error } = await supabase.from('travel_documents').insert(doc).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDocument(
  id: string,
  update: TravelDocumentUpdate,
): Promise<TravelDocumentRow> {
  const { data, error } = await supabase
    .from('travel_documents')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('travel_documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadDocumentFile(
  userId: string,
  docId: string,
  file: File,
): Promise<string> {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('Unsupported file type. Please upload a PDF or image (JPEG, PNG).');
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    throw new Error('File is too large. Maximum size is 10 MB.');
  }
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const path = `${userId}/${docId}/${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteDocumentFile(fileUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return;
  const path = fileUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
