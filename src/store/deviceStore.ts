import { create } from 'zustand';

type State = {
  id?: string;
  name?: string;
  connected: boolean;
  rssi?: number;
  battery?: number;
  set: (patch: Partial<State>) => void;
};
export const useDeviceStore = create<State>((set) => ({
  connected: false,
  set: (patch) => set(patch),
}));
