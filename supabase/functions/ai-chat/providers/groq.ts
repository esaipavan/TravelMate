import type { IAIProvider, AIMessage } from '../types.ts';
import { fetchWithTimeout, isAbortError } from '../utils.ts';

export class GroqProvider implements IAIProvider {
  readonly name = 'groq';
  // NOTE: Groq periodically rotates its model catalog — a stale id returns a
  // 404 "model does not exist or you do not have access to it" on every call
  // (which is exactly how AI recommendations silently broke: the previous
  // `llama-3.3-70b-versatile`, and even `llama-3.1-8b-instant`, are no longer
  // served on this account). `openai/gpt-oss-120b` is a current, high-quality
  // general chat model verified available for this key via /openai/v1/models.
  readonly model = 'openai/gpt-oss-120b';

  private apiKey: string;

  constructor() {
    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) throw new Error('GROQ_API_KEY is not set');
    this.apiKey = key;
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string,
  ): Promise<{ content: string; tokensUsed?: number }> {
    const allMessages: AIMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    let response: Response;
    try {
      response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: allMessages,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });
    } catch (err) {
      if (isAbortError(err)) throw new Error('Groq request timed out');
      throw err;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}
