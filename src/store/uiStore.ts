import { create } from 'zustand';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

type Sport = 'tennis' | 'padel' | 'pickleball';
type UIState = {
  selectedSport: Sport | null;
  setSelectedSport: (s: Sport | null) => void;
  // call once on app start to load persisted value
  rehydrate: () => Promise<void>;
};

const KEY = 'ui.selectedSport.json';

async function persistWrite(value: Sport | null) {
  // simple, dependency-free persistence: small JSON file
  const dir = FileSystem.documentDirectory;
  if (!dir) return; // on web this will be null; we’ll just skip persistence (ok for MVP)
  await FileSystem.writeAsStringAsync(dir + KEY, JSON.stringify({ value }), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

async function persistRead(): Promise<Sport | null> {
  const dir = FileSystem.documentDirectory;
  if (!dir) return null; // web fallback
  const path = dir + KEY;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  try {
    const txt = await FileSystem.readAsStringAsync(path);
    const obj = JSON.parse(txt) as { value: Sport | null };
    return obj?.value ?? null;
  } catch {
    return null;
  }
}

export const useUiStore = create<UIState>((set, get) => ({
  selectedSport: null,
  setSelectedSport: (s) => {
    set({ selectedSport: s });
    // fire-and-forget; if web (no documentDirectory) it just skips
    persistWrite(s).catch(() => {});
  },
  rehydrate: async () => {
    const saved = await persistRead();
    if (saved !== null) set({ selectedSport: saved });
  },
}));
