import type { IAIProvider, AIMessage } from '../types.ts';

export class GeminiProvider implements IAIProvider {
  readonly name = 'gemini';
  readonly model = 'gemini-1.5-flash';

  private apiKey: string;

  constructor() {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    this.apiKey = key;
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string,
  ): Promise<{ content: string; tokensUsed?: number }> {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents, generationConfig: { maxOutputTokens: 2048 } };
    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    // Key goes in a header, not the URL query string — a request URL can end
    // up embedded in error messages (network failures, logs), which would
    // otherwise leak the key wherever those messages surface.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      usageMetadata?: { totalTokenCount: number };
    };

    return {
      content: data.candidates[0].content.parts[0].text,
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  }
}
