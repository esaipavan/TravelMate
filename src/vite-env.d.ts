/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AI_PROVIDER: 'groq' | 'gemini' | 'openrouter';
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_GEOAPIFY_API_KEY: string | undefined;
  readonly VITE_GA_MEASUREMENT_ID: string | undefined;
  readonly VITE_CLARITY_PROJECT_ID: string | undefined;
  readonly VITE_POSTHOG_KEY: string | undefined;
  readonly VITE_POSTHOG_HOST: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
