import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getReminders } from '@/features/reminders/services/reminders.service';
import { getEffectiveStatus } from '@/features/reminders/types';

export interface NotificationItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  isOverdue: boolean;
}

export function useNotificationSummary() {
  const { user } = useAuthStore();
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', user?.id ?? ''],
    queryFn: () => getReminders(user!.id),
    enabled: !!user,
    staleTime: 2 * 60_000,
  });

  const items = useMemo((): NotificationItem[] => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const weekOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekStr = `${weekOut.getFullYear()}-${String(weekOut.getMonth() + 1).padStart(2, '0')}-${String(weekOut.getDate()).padStart(2, '0')}`;

    return reminders
      .filter((r) => {
        const status = getEffectiveStatus(r);
        return (status === 'overdue' || status === 'pending') && r.reminder_date <= weekStr;
      })
      .sort((a, b) => a.reminder_date.localeCompare(b.reminder_date))
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        dueDate: r.reminder_date,
        isOverdue: r.reminder_date < todayStr,
      }));
  }, [reminders]);

  return { items, count: items.length, isLoading };
}
