import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Users, Search, Shield, ShieldOff } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserList, useUpdateUserRole } from '../hooks/useAdminMetrics';
import { initials } from '@/utils/formatters';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useUserList();
  const roleMutation = useUpdateUserRole();

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load users"
        message="Check your admin role and Supabase connection."
        onRetry={() => void refetch()}
      />
    );
  }

  const filtered = (data ?? []).filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Users" description={`${data?.length ?? 0} registered beta users`} />

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No users match your search' : 'No users yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  User
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials(u.full_name ?? u.email ?? '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {u.full_name ?? u.username ?? 'Unknown'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                    {format(parseISO(u.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        u.user_role === 'super_admin'
                          ? 'border-destructive/40 text-destructive'
                          : u.user_role === 'admin'
                            ? 'border-primary/40 text-primary'
                            : 'text-muted-foreground'
                      }
                    >
                      {u.user_role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.user_role !== 'super_admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        disabled={roleMutation.isPending}
                        onClick={() =>
                          void roleMutation.mutate({
                            id: u.id,
                            role: u.user_role === 'admin' ? 'user' : 'admin',
                          })
                        }
                      >
                        {u.user_role === 'admin' ? (
                          <>
                            <ShieldOff className="h-3 w-3" aria-hidden="true" />
                            Remove admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3" aria-hidden="true" />
                            Make admin
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
