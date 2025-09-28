import { create } from 'zustand';
import { getJSON, setJSON } from '../services/storage';

export type SessionSummary = {
  id: string;
  sport: string;
  dateMs: number;
  durationMs: number;
  swings: number;
  maxRally: number;
  avgSpeed: number;
  maxSpeed: number;
  // --- metadata ---
  strapTag?: string;
  racket?: string;
  gripSize?: string;
  overgrip?: boolean;
  notes?: string;
};

type State = {
  sessions: SessionSummary[];
  add: (s: SessionSummary) => void;
  clear: () => void;
};

const KEY = 'sessions/v1';

export const useSessionStore = create<State>((set, get) => ({
  sessions: getJSON<SessionSummary[]>(KEY, []),
  add: (s) => {
    const next = [s, ...get().sessions];
    set({ sessions: next });
    setJSON(KEY, next);
  },
  clear: () => {
    set({ sessions: [] });
    setJSON(KEY, []);
  },
}));
