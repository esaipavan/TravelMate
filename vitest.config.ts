import path from 'path';
import { defineConfig } from 'vitest/config';

// Standalone from vite.config.ts on purpose: the app's Vite config pulls in
// the React and PWA plugins, which unit tests for plain utility functions
// don't need. Only the `@` path alias is shared, kept identical to
// vite.config.ts's resolve.alias so imports resolve the same way in both.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
