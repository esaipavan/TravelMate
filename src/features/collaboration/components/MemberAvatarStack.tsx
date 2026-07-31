import { cn } from '@/lib/utils';
import type { CollabMember } from '../types';

interface Props {
  members: CollabMember[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary text-primary-foreground',
  editor: 'bg-accent text-accent-foreground',
  viewer: 'bg-muted text-muted-foreground',
};

export function MemberAvatarStack({ members, max = 4, size = 'md', className }: Props) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-[11px]';

  return (
    <div
      className={cn('flex items-center', className)}
      role="group"
      aria-label={`${members.length} trip member${members.length !== 1 ? 's' : ''}`}
    >
      {visible.map((m, i) => (
        <div
          key={m.userId}
          title={`${m.name} (${m.role})`}
          aria-label={`${m.name}, ${m.role}`}
          style={{
            zIndex: visible.length - i,
            marginLeft: i === 0 ? 0 : size === 'sm' ? '-6px' : '-8px',
          }}
          className={cn(
            'relative flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-background',
            sizeClasses,
            m.avatarUrl ? '' : (ROLE_COLORS[m.role] ?? ROLE_COLORS['viewer']),
          )}
        >
          {m.avatarUrl ? (
            <img
              src={m.avatarUrl}
              alt={m.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            m.initials
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: size === 'sm' ? '-6px' : '-8px', zIndex: 0 }}
          className={cn(
            'relative flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background',
            sizeClasses,
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
