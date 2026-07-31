/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AI_PROVIDER: 'groq' | 'gemini' | 'openrouter';
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_GEOAPIFY_API_KEY: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
