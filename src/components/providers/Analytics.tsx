import { useEffect } from 'react';

// Extend window for analytics globals (no external type packages needed)
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialises third-party analytics based on environment variables.
 * Each provider is only loaded when its corresponding VITE_ variable is set.
 *
 * Required env vars (set in Vercel project settings):
 *   VITE_GA_MEASUREMENT_ID   — Google Analytics 4  (format: G-XXXXXXXXXX)
 *   VITE_CLARITY_PROJECT_ID  — Microsoft Clarity   (format: random string)
 *   VITE_POSTHOG_KEY         — PostHog project API key
 *   VITE_POSTHOG_HOST        — PostHog host (default: https://app.posthog.com)
 */
export function Analytics() {
  useEffect(() => {
    injectGA();
    injectClarity();
  }, []);

  return null;
}

function injectGA() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id) return;

  const existing = document.querySelector(`script[src*="googletagmanager"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true });
}

function injectClarity() {
  const id = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (!id) return;

  const existing = document.querySelector(`script[src*="clarity.ms"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(script);
}

// PostHog — install posthog-js (npm i posthog-js) then uncomment:
// import posthog from 'posthog-js';
// function initPostHog() {
//   const key = import.meta.env.VITE_POSTHOG_KEY;
//   if (!key) return;
//   posthog.init(key, {
//     api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
//     loaded: (ph) => { if (import.meta.env.DEV) ph.opt_out_capturing(); },
//   });
// }
