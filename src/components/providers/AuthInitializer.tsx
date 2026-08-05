import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase.from('profiles').select('user_role').eq('id', userId).single();

  const raw = (data as { user_role: string } | null)?.user_role;

  if (raw === UserRole.ADMIN || raw === UserRole.SUPER_ADMIN || raw === UserRole.USER) {
    return raw;
  }

  return UserRole.USER;
}

export function AuthInitializer() {
  const { setUser, setSession, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    // Subscribe before getSession() so no SIGNED_IN / TOKEN_REFRESHED events are missed.
    // Callback is intentionally synchronous — Supabase discourages async callbacks here.
    // Role fetching is fire-and-forget; errors fall back to UserRole.USER.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id)
          .then((role) => setRole(role))
          .catch(() => setRole(UserRole.USER));
      } else {
        setRole(UserRole.USER);
      }
    });

    // getSession() is the single source of truth for the initial isLoading flag.
    // It waits for Supabase's internal initializePromise (session recovery + token
    // refresh) before resolving, so by the time finally() fires the auth state is
    // fully settled and route guards can make a reliable decision.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserRole(session.user.id)
            .then((role) => setRole(role))
            .catch(() => setRole(UserRole.USER));
        }
      })
      .catch((err) => {
        // Log but do NOT call reset() — a transient network error during token
        // refresh must not clear a valid session that onAuthStateChange already set.
        if (import.meta.env.DEV) {
          console.warn('[AuthInitializer] getSession error:', err);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
