import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'TravelMate',
        short_name: 'TravelMate',
        description: 'Plan trips, track expenses, and explore the world — all in one place.',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Cache all build assets — includes png for Leaflet marker images
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],

        // SPA fallback — serve index.html for all navigation requests
        navigateFallback: 'index.html',

        // Only block Vite internals and Supabase server-side auth API.
        // /auth/callback is a client-side React route and must be served by the SW.
        // No allowlist: Workbox's default [/./] handles every non-denied path.
        navigateFallbackDenylist: [/^\/__/, /\/auth\/v1\//],

        runtimeCaching: [
          // Supabase REST API — NetworkFirst so offline falls back to cache
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase Storage (avatars, documents) — CacheFirst
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts (if ever added) — StaleWhileRevalidate
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },

      devOptions: {
        // Enable service worker in development for testing offline behaviour
        enabled: false, // flip to true when you want to test SW locally
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      plugins: [
        process.env.ANALYZE === 'true' &&
          visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }),
      ],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Core framework — always in the critical path
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/react-router') ||
            id.includes('/scheduler/')
          )
            return 'vendor';
          // Data layer
          if (id.includes('/@tanstack/')) return 'query';
          if (id.includes('/@supabase/')) return 'supabase';
          // Charts — recharts bundles its own d3 tree, keep together
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor'))
            return 'charts';
          // Icons — lucide-react is used by every page; named chunk stabilises its hash
          if (id.includes('/lucide-react/')) return 'icons';
          // Headless UI — Radix primitives + shadcn wrappers
          if (id.includes('/@radix-ui/')) return 'ui';
          // Date utilities
          if (id.includes('/date-fns/')) return 'date-fns';
          // Form validation
          if (id.includes('/zod/') || id.includes('/@hookform/')) return 'validation';
          // Map libraries (NearbyPage only — lazy-loaded per-route)
          if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) return 'maps';
        },
      },
    },
  },
});
