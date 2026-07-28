import { supabase } from '@/lib/supabase';
import type { AIMessage, AIRequestOptions, AIResponse } from './ai.types';

/** Single public function the entire app uses for AI — never calls a provider directly. */
export async function chatWithAI(
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> {
  const result = await supabase.functions.invoke<AIResponse>('ai-chat', {
    body: { messages, options },
  });

  if (result.error) {
    const msg = result.error instanceof Error ? result.error.message : 'AI request failed';
    throw new Error(msg);
  }
  if (!result.data) throw new Error('No response from AI service');

  return result.data;
}

export async function streamChatWithAI(
  messages: AIMessage[],
  options: AIRequestOptions | undefined,
  _onChunk: (chunk: string) => void,
  onDone: (response: AIResponse) => void,
): Promise<void> {
  const result = await supabase.functions.invoke<AIResponse>('ai-chat', {
    body: { messages, options, stream: true },
  });

  if (result.error) {
    const msg = result.error instanceof Error ? result.error.message : 'AI stream failed';
    throw new Error(msg);
  }
  if (!result.data) throw new Error('No response from AI stream');

  onDone(result.data);
}
