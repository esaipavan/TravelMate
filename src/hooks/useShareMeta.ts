import { useEffect } from 'react';

// ── Client-side share/preview metadata ───────────────────────────────────────
// A small, dependency-free head manager for the public itinerary page. It upserts
// Open Graph / Twitter / canonical tags from real trip data and restores the
// previous values on unmount, so navigating away leaves the site-level defaults
// (from index.html) intact.
//
// This is a client-rendered SPA: these tags are present in the live DOM and are
// read by link-preview crawlers that execute JavaScript. Non-JS crawlers still
// fall back to the honest site-level defaults in index.html. Pass `null` to
// apply nothing (e.g. while loading, or for a private/not-found trip) so no
// trip data is ever exposed for a page that didn't resolve a public trip.

export interface ShareMeta {
  /** Document + og/twitter title. */
  title: string;
  /** Meta description shared across description / og / twitter. */
  description: string;
  /** Absolute canonical + og:url. */
  url: string;
  /** Absolute preview image; when omitted the site-level default image stays. */
  image?: string | null;
  /** og:type — defaults to 'website'. */
  type?: string;
}

export function useShareMeta(meta: ShareMeta | null): void {
  useEffect(() => {
    if (!meta) return;

    const restores: Array<() => void> = [];

    const prevTitle = document.title;
    document.title = meta.title;
    restores.push(() => {
      document.title = prevTitle;
    });

    const setMeta = (attr: 'property' | 'name', key: string, content: string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (existing) {
        const prev = existing.getAttribute('content');
        existing.setAttribute('content', content);
        restores.push(() => {
          if (prev === null) existing.removeAttribute('content');
          else existing.setAttribute('content', prev);
        });
      } else {
        const el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('content', content);
        document.head.appendChild(el);
        restores.push(() => el.remove());
      }
    };

    const setCanonical = (href: string) => {
      const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (existing) {
        const prev = existing.getAttribute('href');
        existing.setAttribute('href', href);
        restores.push(() => {
          if (prev === null) existing.removeAttribute('href');
          else existing.setAttribute('href', prev);
        });
      } else {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        el.setAttribute('href', href);
        document.head.appendChild(el);
        restores.push(() => el.remove());
      }
    };

    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', meta.url);
    setMeta('property', 'og:type', meta.type ?? 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setCanonical(meta.url);

    // Only override the image when we have a real one — otherwise the honest
    // site-level default image (index.html) is left in place.
    if (meta.image) {
      setMeta('property', 'og:image', meta.image);
      setMeta('property', 'og:image:alt', meta.title);
      setMeta('name', 'twitter:image', meta.image);
    }

    return () => {
      // Restore in reverse so nested/created tags unwind cleanly.
      for (const restore of restores.reverse()) restore();
    };
  }, [meta]);
}
