import { create } from 'zustand';

type State = {
  id?: string;
  name?: string;
  connected: boolean;
  rssi?: number;
  battery?: number;
  // Debug/link stats (can be undefined until we fill them)
  mtuTarget?: number;
  mtuNegotiated?: number;
  notifySamples?: number;
  packetHz?: number;
  dropPct?: number;
  set: (patch: Partial<State>) => void;
  reset: () => void;
};

export const useDeviceStore = create<State>((set) => ({
  connected: false,
  set: (patch) => set(patch),
  reset: () =>
    set({
      id: undefined,
      name: undefined,
      connected: false,
      rssi: undefined,
      battery: undefined,
      mtuTarget: undefined,
      mtuNegotiated: undefined,
      notifySamples: undefined,
      packetHz: undefined,
      dropPct: undefined,
    }),
}));
