import type { IAIProvider, AIMessage } from '../types.ts';
import { fetchWithTimeout, isAbortError } from '../utils.ts';

export class OpenRouterProvider implements IAIProvider {
  readonly name = 'openrouter';
  readonly model = 'mistralai/mistral-7b-instruct:free';

  private apiKey: string;

  constructor() {
    const key = Deno.env.get('OPENROUTER_API_KEY');
    if (!key) throw new Error('OPENROUTER_API_KEY is not set');
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
      response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://travelmate.app',
          'X-Title': 'TravelMate AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: allMessages,
          max_tokens: 2048,
        }),
      });
    } catch (err) {
      if (isAbortError(err)) throw new Error('OpenRouter request timed out');
      throw err;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${error}`);
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
