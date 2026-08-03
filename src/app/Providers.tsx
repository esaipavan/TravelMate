import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LazyMotion, domMax } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { ErrorReporter } from '@/components/providers/ErrorReporter';
import { Analytics } from '@/components/providers/Analytics';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/*
         * LazyMotion makes domMax features (including layout animations and
         * layoutId) available to `m.*` components throughout the tree.
         * Existing `motion.*` components load their own features synchronously
         * and are unaffected. strict={false} (default) allows both APIs.
         */}
        <LazyMotion features={domMax}>
          <AuthInitializer />
          <ThemeInitializer />
          <PWAUpdatePrompt />
          <ErrorReporter />
          <Analytics />
          {children}
          <Toaster richColors position="top-right" />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </LazyMotion>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
