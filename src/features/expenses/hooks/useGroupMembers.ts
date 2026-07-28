import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { memberInitials } from '../utils/settlement';
import type { TripMember, MemberRole } from '../utils/settlement';

export type { TripMember, MemberRole };

function storageKey(tripId: string): string {
  return `tm-group-${tripId}`;
}

function loadFromStorage(tripId: string): TripMember[] | null {
  try {
    const raw = localStorage.getItem(storageKey(tripId));
    if (raw) return JSON.parse(raw) as TripMember[];
  } catch {
    /* ignore */
  }
  return null;
}

function persist(tripId: string, members: TripMember[]): void {
  try {
    localStorage.setItem(storageKey(tripId), JSON.stringify(members));
  } catch {
    /* ignore */
  }
}

interface UseGroupMembersResult {
  members: TripMember[];
  ownerMemberId: string;
  addMember: (name: string, email?: string) => void;
  removeMember: (id: string) => void;
  updateRole: (id: string, role: MemberRole) => void;
}

export function useGroupMembers(tripId: string): UseGroupMembersResult {
  const user = useAuthStore((s) => s.user);

  const [members, setMembers] = useState<TripMember[]>(() => {
    const userId = user?.id ?? '';
    const stored = loadFromStorage(tripId);
    // Use stored data only if the first member (owner) still matches the logged-in user
    if (stored && stored.length > 0 && stored[0]?.id === userId) return stored;

    if (!userId) return [];
    const meta = user?.user_metadata as Record<string, unknown> | undefined;
    const name =
      (typeof meta?.['full_name'] === 'string' ? meta['full_name'] : null) ??
      user?.email?.split('@')[0] ??
      'You';
    const avatarUrl = typeof meta?.['avatar_url'] === 'string' ? meta['avatar_url'] : null;
    return [
      {
        id: userId,
        name,
        email: user?.email ?? '',
        initials: memberInitials(name),
        role: 'owner',
        isOwner: true,
        avatarUrl,
      },
    ];
  });

  useEffect(() => {
    persist(tripId, members);
  }, [tripId, members]);

  const addMember = useCallback((name: string, email = '') => {
    const newMember: TripMember = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      initials: memberInitials(name.trim()),
      role: 'editor',
      isOwner: false,
      avatarUrl: null,
    };
    setMembers((prev) => [...prev, newMember]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.isOwner || m.id !== id));
  }, []);

  const updateRole = useCallback((id: string, role: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }, []);

  return {
    members,
    ownerMemberId: user?.id ?? '',
    addMember,
    removeMember,
    updateRole,
  };
}
