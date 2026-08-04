import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { identify } from '@/lib/analytics';

// Bridges auth state into the analytics identity layer.
// Runs at the root of the tree so identify() fires before any page-view event.
export function Analytics() {
  const { user } = useAuthStore();

  useEffect(() => {
    identify(user?.id ?? null);
  }, [user?.id]);

  return null;
}
