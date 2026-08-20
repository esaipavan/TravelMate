import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingDraft, BookingStatus } from '../types';

// In-app booking drafts, persisted locally. Mode-agnostic so future transport
// bookings (trains/buses/flights) can live in the same store without a schema
// change. No backend yet — drafts survive refresh via localStorage.

interface BookingState {
  drafts: BookingDraft[];
  addDraft: (draft: BookingDraft) => void;
  removeDraft: (id: string) => void;
  setStatus: (id: string, status: BookingStatus) => void;
  clear: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      drafts: [],
      addDraft: (draft) =>
        set((state) => ({ drafts: [draft, ...state.drafts.filter((d) => d.id !== draft.id)] })),
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),
      setStatus: (id, status) =>
        set((state) => ({
          drafts: state.drafts.map((d) => (d.id === id ? { ...d, status } : d)),
        })),
      clear: () => set({ drafts: [] }),
    }),
    { name: 'travelmate-bookings' },
  ),
);
