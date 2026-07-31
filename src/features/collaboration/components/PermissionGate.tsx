import type { ReactNode } from 'react';
import type { EffectiveRole } from '../types';

interface Props {
  role: EffectiveRole;
  require: 'owner' | 'editor' | 'member';
  children: ReactNode;
  fallback?: ReactNode;
}

const ROLE_RANK: Record<NonNullable<EffectiveRole>, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

const REQUIRED_RANK: Record<Props['require'], number> = {
  owner: 3,
  editor: 2,
  member: 1,
};

export function PermissionGate({ role, require: req, children, fallback = null }: Props) {
  if (!role) return <>{fallback}</>;
  const userRank = ROLE_RANK[role] ?? 0;
  const requiredRank = REQUIRED_RANK[req];
  return userRank >= requiredRank ? <>{children}</> : <>{fallback}</>;
}
