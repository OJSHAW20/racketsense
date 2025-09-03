import { create } from 'zustand';
type State = {
  sport: 'tennis' | 'padel' | 'pickleball' | null;
  setSport: (s: State['sport']) => void;
};
export const useUiStore = create<State>((set)=>({
  sport: null,
  setSport: (s) => set({ sport: s }),
}));
