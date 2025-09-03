import { create } from 'zustand';
type State = {
  qa: boolean;
  strapTag: 'A'|'B'|'C';
  set: (p: Partial<State>) => void;
};
export const useQaStore = create<State>((set)=>({
  qa: true,
  strapTag: 'A',
  set: (p)=>set(p),
}));
