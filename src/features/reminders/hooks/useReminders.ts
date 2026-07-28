import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { getTrips } from '@/features/trips/services/trips.service';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../services/reminders.service';
import type {
  ReminderRow,
  ReminderInsert,
  ReminderUpdate,
  ReminderFormValues,
  ReminderType,
} from '../types';

const REM_KEY = (uid: string) => ['reminders', uid] as const;
const TRIPS_KEY = (uid: string) => ['trips', uid] as const;

export function useReminders() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: REM_KEY(user?.id ?? ''),
    queryFn: () => getReminders(user!.id),
    enabled: !!user,
    staleTime: 2 * 60_000,
  });
}

export function useReminderTrips() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: TRIPS_KEY(user?.id ?? ''),
    queryFn: () => getTrips(user!.id),
    enabled: !!user,
    staleTime: 10 * 60_000,
    select: (rows) => rows.map((t) => ({ id: t.id, title: t.title, destination: t.destination })),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (values: ReminderFormValues) => {
      if (!user) throw new Error('Not authenticated');
      const insert: ReminderInsert = {
        user_id: user.id,
        title: values.title,
        description: values.description || null,
        trip_id: values.trip_id || null,
        type: values.type as ReminderType,
        reminder_date: values.reminder_date,
        reminder_time: values.reminder_time || null,
        priority: values.priority,
        status: 'pending',
        repeat: values.repeat,
        is_snoozed: false,
      };
      return createReminder(insert);
    },
    onSuccess: () => {
      if (user) void qc.invalidateQueries({ queryKey: REM_KEY(user.id) });
      toast.success('Reminder created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ReminderFormValues }) => {
      const update: ReminderUpdate = {
        title: values.title,
        description: values.description || null,
        trip_id: values.trip_id || null,
        type: values.type as ReminderType,
        reminder_date: values.reminder_date,
        reminder_time: values.reminder_time || null,
        priority: values.priority,
        repeat: values.repeat,
      };
      return updateReminder(id, update);
    },
    onSuccess: () => {
      if (user) void qc.invalidateQueries({ queryKey: REM_KEY(user.id) });
      toast.success('Reminder updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMarkComplete() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, complete }: { id: string; complete: boolean }) =>
      updateReminder(id, {
        status: complete ? 'completed' : 'pending',
        completed_at: complete ? new Date().toISOString() : null,
        is_snoozed: false,
        snoozed_until: null,
      }),
    onMutate: async ({ id, complete }) => {
      if (!user) return;
      const key = REM_KEY(user.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderRow[]>(key);
      qc.setQueryData<ReminderRow[]>(
        key,
        (old) =>
          old?.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: complete ? 'completed' : 'pending',
                  completed_at: complete ? new Date().toISOString() : null,
                }
              : r,
          ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (user && ctx?.previous) qc.setQueryData(REM_KEY(user.id), ctx.previous);
      toast.error('Failed to update reminder');
    },
    onSettled: () => {
      if (user) void qc.invalidateQueries({ queryKey: REM_KEY(user.id) });
    },
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => {
      const snoozedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
      return updateReminder(id, { is_snoozed: true, snoozed_until: snoozedUntil });
    },
    onSuccess: () => {
      if (user) void qc.invalidateQueries({ queryKey: REM_KEY(user.id) });
      toast.success('Reminder snoozed');
    },
    onError: () => toast.error('Failed to snooze reminder'),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onMutate: async (id) => {
      if (!user) return;
      const key = REM_KEY(user.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ReminderRow[]>(key);
      qc.setQueryData<ReminderRow[]>(key, (old) => old?.filter((r) => r.id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (user && ctx?.previous) qc.setQueryData(REM_KEY(user.id), ctx.previous);
      toast.error('Failed to delete reminder');
    },
    onSettled: () => {
      if (user) void qc.invalidateQueries({ queryKey: REM_KEY(user.id) });
    },
    onSuccess: () => toast.success('Reminder deleted'),
  });
}
