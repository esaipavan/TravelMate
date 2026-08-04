import { supabase } from '@/lib/supabase';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Returns (or creates) the single conversation for this user+trip pair.
async function getOrCreateConversation(userId: string, tripId: string | null): Promise<string> {
  if (tripId) {
    const { data: existing } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) return existing.id;
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, trip_id: tripId })
    .select('id')
    .single();

  if (error || !data) throw new Error('Failed to create AI conversation');
  return data.id;
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
