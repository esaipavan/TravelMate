import { useMemo } from 'react';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import type { DestinationTheme } from '@/utils/destinationTheme';

export type { DestinationTheme };

export function useDestinationTheme(destination: string): DestinationTheme {
  return useMemo(() => resolveDestinationTheme(destination), [destination]);
}
