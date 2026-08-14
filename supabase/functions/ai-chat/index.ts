import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { AIRequestBody, AIResponse, IAIProvider } from './types.ts';
import { GroqProvider } from './providers/groq.ts';
import { GeminiProvider } from './providers/gemini.ts';
import { OpenRouterProvider } from './providers/openrouter.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_SYSTEM_PROMPT = `You are an expert AI travel assistant embedded in TravelMate, a travel planning application. You help travellers plan trips, manage budgets, and make the most of their journeys.

Your expertise covers:
- **Destination recommendations** — must-see sights, hidden gems, best time to visit, neighbourhood guides
- **Trip planning** — day-by-day itinerary ideas, logical route suggestions, time estimates, skip-the-line tips
- **Budget planning** — realistic cost breakdowns, money-saving tips, free vs paid activities, cost-of-living context
- **Packing suggestions** — climate-specific gear, carry-on vs checked, minimalist packing, what locals actually wear
- **Weather advice** — seasonal conditions, monsoon/winter/summer impact, how to dress and prepare
- **Local transportation** — airports, trains, buses, ride-sharing, rental cars, city passes, tuk-tuks
- **Nearby attractions** — museums, parks, viewpoints, local markets, festivals, day-trip options
- **Food recommendations** — local dishes to try, restaurant districts, street food safety, dietary tips, food markets
- **Safety tips** — common scams, safe neighbourhoods, emergency contacts, travel insurance advice, health precautions
- **Visa & entry guidance** — general visa categories, passport validity requirements, arrival procedures overview
- **Currency & money** — when to exchange, using ATMs abroad, credit card fees, digital payments, tipping norms

**Formatting rules:**
- Use markdown: bullet points, **bold** key terms, numbered lists for step-by-step advice
- Keep answers focused, actionable, and specific — avoid vague generalities
- When trip context is provided, personalise every response to the specific destination and dates
- For budget questions, provide concrete numbers where possible (e.g., "street food averages $2–5 per meal")
- Lead with the most important information first`;

function getProvider(): IAIProvider {
  const providerName = Deno.env.get('AI_PROVIDER') ?? 'groq';

  switch (providerName) {
    case 'gemini':
      return new GeminiProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'groq':
    default:
      return new GroqProvider();
  }
}

// Redacts URLs and key/token/auth-like substrings from a provider or network
// error before it's logged, persisted, or (never) returned to the client —
// a defense-in-depth backstop in case any provider's error text ever echoes
// back its own request URL, headers, or credentials.
function sanitizeProviderError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/\b(key|token|authorization|bearer)\b[=:]?\s*\S+/gi, '$1=[redacted]')
    .slice(0, 300);
}

async function tryProviders(
  messages: AIRequestBody['messages'],
  systemPrompt: string,
): Promise<{ result: Awaited<ReturnType<IAIProvider['chat']>>; provider: IAIProvider }> {
  // Fallback chain: primary → gemini → openrouter
  const chain: (() => IAIProvider)[] = [
    getProvider,
    () => new GeminiProvider(),
    () => new OpenRouterProvider(),
  ];

  let lastError: Error | null = null;

  for (const makeProvider of chain) {
    try {
      const provider = makeProvider();
      const result = await provider.chat(messages, systemPrompt);
      return { result, provider };
    } catch (err) {
      lastError = new Error(sanitizeProviderError(err));
      console.error(`Provider failed, trying next: ${lastError.message}`);
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const startTime = Date.now();
  let userId: string | null = null;
  let provider: IAIProvider | null = null;
  let success = false;
  let errorMessage: string | null = null;
  let tokensUsed: number | undefined;

  try {
    // Verify Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    userId = user.id;

    // Parse body
    const body = (await req.json()) as AIRequestBody;
    const { messages, options } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt
    let systemPrompt = options?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
    if (options?.tripContext) {
      const ctx = options.tripContext;
      systemPrompt += `\n\nTrip context:\n- Destination: ${ctx.destination}\n- Dates: ${ctx.startDate} to ${ctx.endDate}${ctx.budget ? `\n- Budget: ${ctx.currency ?? 'INR'} ${ctx.budget}` : ''}`;
    }

    // Call AI with fallback chain
    const { result, provider: usedProvider } = await tryProviders(messages, systemPrompt);
    provider = usedProvider;
    tokensUsed = result.tokensUsed;
    success = true;

    const responseBody: AIResponse = {
      content: result.content,
      provider: usedProvider.name,
      model: usedProvider.model,
      tokensUsed: result.tokensUsed,
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    errorMessage = sanitizeProviderError(err);
    console.error('AI chat error:', errorMessage);

    // Never echo raw provider/network error text to the client — it can
    // carry a request URL, header value, or other internal detail. The
    // sanitized version above still reaches server logs and the usage-log
    // table below for debugging.
    return new Response(JSON.stringify({ error: 'AI request failed. Please try again shortly.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } finally {
    // Log usage (best-effort, uses service role to bypass RLS)
    try {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      await serviceClient.from('ai_usage_logs').insert({
        user_id: userId,
        provider: provider?.name ?? 'unknown',
        model: provider?.model ?? 'unknown',
        prompt_tokens: null,
        completion_tokens: null,
        latency_ms: Date.now() - startTime,
        success,
        error_message: errorMessage,
      });
    } catch {
      // Non-fatal — don't fail the request over logging
    }
  }
});
