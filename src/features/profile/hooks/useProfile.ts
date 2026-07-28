import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { queryClient as appQueryClient } from '@/lib/queryClient';
import { getTrips } from '@/features/trips/services/trips.service';
import { getDocuments } from '@/features/documents/services/documents.service';
import { getReminders } from '@/features/reminders/services/reminders.service';
import {
  getAllExpenses,
  getAllJournalEntries,
} from '@/features/analytics/services/analytics.service';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  deleteUserFiles,
  exportUserData,
} from '../services/profile.service';
import type { ProfileRow, ProfileUpdate } from '../types';

// ── Profile query ─────────────────────────────────────────────────────────────

export function useProfile() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  return useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getProfile(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });
}

// ── Update profile ────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateProfile(uid, update),
    onSuccess: (updated) => {
      qc.setQueryData(['profile', uid], updated);
      toast.success('Profile updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Avatar mutations ──────────────────────────────────────────────────────────

export function useUploadAvatar() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(uid, file),
    onSuccess: async (avatarUrl) => {
      await updateProfile(uid, { avatar_url: avatarUrl });
      qc.setQueryData<ProfileRow>(['profile', uid], (prev) =>
        prev ? { ...prev, avatar_url: avatarUrl } : prev,
      );
      toast.success('Profile photo updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveAvatar() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (currentUrl: string) => removeAvatar(currentUrl),
    onSuccess: async () => {
      await updateProfile(uid, { avatar_url: null });
      qc.setQueryData<ProfileRow>(['profile', uid], (prev) =>
        prev ? { ...prev, avatar_url: null } : prev,
      );
      toast.success('Profile photo removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Account mutations ─────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => toast.success('Password updated'),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      toast.success('Verification email sent — check your inbox to confirm the new address.'),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSignOutAll() {
  const { reset } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      reset();
      window.location.href = '/login';
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteAccount() {
  const { reset } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      reset();
      appQueryClient.clear();
      window.location.href = '/login';
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Privacy ───────────────────────────────────────────────────────────────────

export function useExportData() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  return useMutation({
    mutationFn: () => exportUserData(uid),
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'travelmate-data.json';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteUploadedFiles() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  return useMutation({
    mutationFn: () => deleteUserFiles(uid),
    onSuccess: async () => {
      await updateProfile(uid, { avatar_url: null });
      void appQueryClient.invalidateQueries({ queryKey: ['profile', uid] });
      toast.success('Uploaded files deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ── Profile statistics ────────────────────────────────────────────────────────

export function useProfileStats() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', uid],
    queryFn: () => getTrips(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });
  const { data: documents = [] } = useQuery({
    queryKey: ['documents', uid],
    queryFn: () => getDocuments(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', uid],
    queryFn: () => getReminders(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ['analytics', uid, 'expenses'],
    queryFn: () => getAllExpenses(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['analytics', uid, 'journal'],
    queryFn: () => getAllJournalEntries(uid),
    enabled: !!uid,
    staleTime: 5 * 60_000,
  });

  return {
    totalTrips: trips.length,
    countriesVisited: new Set(trips.map((t) => t.country_code ?? t.destination)).size,
    journalEntries: journalEntries.length,
    documentsStored: documents.length,
    reminders: reminders.length,
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
  };
}
