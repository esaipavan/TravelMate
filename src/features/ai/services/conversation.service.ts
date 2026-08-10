import { supabase } from '@/lib/supabase';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Finds the conversation id for a user+trip pair. Handles a null trip_id
// (the global, non-trip assistant) with `is('trip_id', null)` so it dedupes
// correctly under the UNIQUE (user_id, trip_id) NULLS NOT DISTINCT constraint.
function findConversationId(userId: string, tripId: string | null) {
  let q = supabase.from('ai_conversations').select('id').eq('user_id', userId);
  q = tripId === null ? q.is('trip_id', null) : q.eq('trip_id', tripId);
  return q.order('created_at', { ascending: false }).limit(1).maybeSingle();
}

// Returns (or creates) the single conversation for this user+trip pair.
// Concurrency-safe: if two callers race the INSERT, the UNIQUE (user_id,
// trip_id) constraint rejects the loser with 23505 and we re-read the winner.
async function getOrCreateConversation(userId: string, tripId: string | null): Promise<string> {
  const { data: existing } = await findConversationId(userId, tripId);
  if (existing) return existing.id;

  const { data: inserted, error: insertErr } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, trip_id: tripId })
    .select('id')
    .single();

  if (inserted) return inserted.id;

  // Lost a concurrent race — the unique constraint rejected this insert.
  // Re-read the row the winning caller created.
  if (insertErr?.code === '23505') {
    const { data: winner } = await findConversationId(userId, tripId);
    if (winner) return winner.id;
  }

  throw new Error('Failed to create AI conversation');
}

export async function loadHistory(
  userId: string,
  tripId: string | null,
  limit = 40,
): Promise<ConversationMessage[]> {
  try {
    const convId = await getOrCreateConversation(userId, tripId);
    const { data } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(limit);

    return (data ?? []) as ConversationMessage[];
  } catch {
    return [];
  }
}

// "New conversation" under the one-conversation-per-(user, trip) model:
// reuse the existing conversation and clear its messages rather than
// inserting a second row (which the unique constraint would reject).
export async function createNewConversation(
  userId: string,
  tripId: string | null,
): Promise<string> {
  const convId = await getOrCreateConversation(userId, tripId);
  await supabase.from('ai_messages').delete().eq('conversation_id', convId);
  return convId;
}

export async function clearConversation(userId: string, tripId: string | null): Promise<void> {
  try {
    const convId = await getOrCreateConversation(userId, tripId);
    await supabase.from('ai_messages').delete().eq('conversation_id', convId);
  } catch {
    // non-critical — UI already cleared local state
  }
}

export function saveMessages(
  userId: string,
  tripId: string | null,
  userContent: string,
  assistantContent: string,
): void {
  void (async () => {
    try {
      const convId = await getOrCreateConversation(userId, tripId);
      await supabase.from('ai_messages').insert([
        { conversation_id: convId, role: 'user', content: userContent },
        { conversation_id: convId, role: 'assistant', content: assistantContent },
      ]);
    } catch {
      // non-critical — chat still works without persistence
    }
  })();
}
