// src/store/qaStore.ts
import { create } from 'zustand';

type QaState = {
  strapTag: string;
  racket: string;
  gripSize: string;
  overgrip: boolean;
  notes: string;
  setStrapTag: (v: string) => void;
  setRacket: (v: string) => void;
  setGripSize: (v: string) => void;
  setOvergrip: (v: boolean) => void;
  setNotes: (v: string) => void;
  reset: () => void;
};

// Simple in-memory defaults; if you later want persistence, we can add MMKV.
export const useQaStore = create<QaState>((set) => ({
  strapTag: 'Strap-A',
  racket: 'Default Racket',
  gripSize: 'M',
  overgrip: false,
  notes: '',
  setStrapTag: (v) => set({ strapTag: v }),
  setRacket: (v) => set({ racket: v }),
  setGripSize: (v) => set({ gripSize: v }),
  setOvergrip: (v) => set({ overgrip: v }),
  setNotes: (v) => set({ notes: v }),
  reset: () =>
    set({
      strapTag: 'Strap-A',
      racket: 'Default Racket',
      gripSize: 'M',
      overgrip: false,
      notes: '',
    }),
}));
