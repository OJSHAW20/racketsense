import { SAMPLE_HZ, SAMPLES_PER_NOTIFY } from '../config/constants';
import type { DeviceInfo, ImuBatchHandler, Sample } from '../types/ble';
import { useDeviceStore } from '../store/deviceStore';

// --- Link simulation state ---
let SIM = {
  mtu: 247 as 23 | 185 | 247,
  samplesPerNotify: 10, // N; you already compute N from constants — this can override
  dropEveryN: 0,        // 0 = no drops; e.g. 50 => drop every 50th packet
};

let packetIndex = 0;

// --- Error / recovery simulation state ---
let NEXT_SCAN_FAIL = false;
let NEXT_CONNECT_FAIL = false;
let CURRENT_UNSUB: (() => void) | null = null;

// Call this to update deviceStore debug fields whenever SIM changes
function reflectLinkIntoStore() {
  const st = useDeviceStore.getState();
  st.set({
    mtuTarget: 247,
    mtuNegotiated: SIM.mtu,
    notifySamples: SIM.samplesPerNotify,
  });
}

// Public setter (we’ll export it at the bottom)
function setLinkSim(opts: Partial<typeof SIM>) {
  SIM = { ...SIM, ...opts };
  reflectLinkIntoStore();
}

// Public helpers for error/recovery
function setNextScanFail() {
  NEXT_SCAN_FAIL = true;
}

function setNextConnectFail() {
  NEXT_CONNECT_FAIL = true;
}

function triggerDisconnectNow() {
  // stop IMU stream “mid-session”
  if (CURRENT_UNSUB) {
    try {
      CURRENT_UNSUB();
    } catch {}
    CURRENT_UNSUB = null;
  }
  // reset store to simulate link drop
  useDeviceStore.getState().reset();
}

reflectLinkIntoStore();

type Sub = { stop: () => void };

// Robust fallbacks so we never emit empty batches
const HZ =
  typeof SAMPLE_HZ === 'number' && isFinite(SAMPLE_HZ) && SAMPLE_HZ > 0
    ? SAMPLE_HZ
    : 200;
const N =
  typeof SAMPLES_PER_NOTIFY === 'number' && isFinite(SAMPLES_PER_NOTIFY) && SAMPLES_PER_NOTIFY > 0
    ? SAMPLES_PER_NOTIFY
    : 10;

function noise(scale = 1) {
  return (Math.random() - 0.5) * scale;
}

export const MockBle = {
  async startScan(onDevice: (d: DeviceInfo) => void): Promise<Sub> {
    if (NEXT_SCAN_FAIL) {
      NEXT_SCAN_FAIL = false;
      return { stop: () => {} }; // simulate silent timeout
    }
    const id = 'MOCK-IMU-001';
    let alive = true;
    setTimeout(() => {
      if (alive) onDevice({ id, name: 'RacketSense Mock', rssi: -45 });
    }, 300);
    return { stop: () => { alive = false; } };
  },

  async connect(id: string) {
    if (NEXT_CONNECT_FAIL) {
      NEXT_CONNECT_FAIL = false;
      throw new Error('Mock connect failed');
    }
    if (__DEV__) console.log('[mockBle] connect', id);
    return { id, name: 'RacketSense Mock' } as DeviceInfo;
  },

  async disconnect() {
    if (__DEV__) console.log('[mockBle] disconnect');
  },

  async writeControl(_opcode: number, _payload?: Uint8Array) {
    // no-op in mock
  },

  async readBattery(): Promise<number> {
    return 95;
  },

  subscribeImu(onBatch: ImuBatchHandler): () => void {
    const dtSample = 1000 / HZ;

    // Use SIM.samplesPerNotify if set; otherwise the computed N
    const N_eff = SIM.samplesPerNotify > 0 ? SIM.samplesPerNotify : N;
    const dtBatch = dtSample * N_eff;

    let t_ms = Date.now();

    if (__DEV__) console.log('[mockBle] subscribeImu start', { HZ, N: N_eff, dtBatch });

    const makeBatch = (): Sample[] => {
      const batch: Sample[] = new Array(N_eff);
      for (let i = 0; i < N_eff; i++) {
        const t = t_ms + i * dtSample;
        batch[i] = {
          t_ms: t,
          ax: noise(0.05),
          ay: noise(0.05),
          az: 9.81 + noise(0.05),
          gx: noise(0.02),
          gy: noise(0.02),
          gz: noise(0.02),
        };
      }

      // occasional “impact” burst
      if (Math.random() < 0.25) {
        const axis = (['x','y','z'] as const)[Math.floor(Math.random() * 3)];
        const gyroPeak = 12 + Math.random() * 6; // 12–18 rad/s
        const ACC_PULSE = 80;
        const mid = Math.max(1, Math.floor(N_eff / 2));
        const shape = [0.0, 1.0, 0.0];
        for (let o = -1; o <= 1; o++) {
          const idx = mid + o;
          if (idx < 0 || idx >= batch.length) continue;
          const w = shape[o + 1];
          const s = batch[idx];
          if (axis === 'x') { s.gx += gyroPeak * w; s.ax += ACC_PULSE * w; }
          if (axis === 'y') { s.gy += gyroPeak * w; s.ay += ACC_PULSE * w; }
          if (axis === 'z') { s.gz += gyroPeak * w; s.az += ACC_PULSE * w; }
        }
      }

      t_ms += dtBatch;
      return batch;
    };

    // emit immediately, then on a fixed cadence
    onBatch(makeBatch());

    const startedAt = Date.now();
    let emittedPackets = 0;
    let droppedPackets = 0;

    const id = setInterval(() => {
      packetIndex++;

      const shouldDrop = SIM.dropEveryN > 0 && packetIndex % SIM.dropEveryN === 0;

      if (!shouldDrop) {
        onBatch(makeBatch());
        emittedPackets++;
      } else {
        droppedPackets++;
      }

      if (packetIndex % 30 === 0) {
        const elapsed = Math.max(0.001, (Date.now() - startedAt) / 1000);
        const approxHz = Math.round((emittedPackets * N_eff) / elapsed);
        useDeviceStore.getState().set({
          packetHz: approxHz,
          dropPct:
            droppedPackets + emittedPackets > 0
              ? Math.round((droppedPackets / (droppedPackets + emittedPackets)) * 1000) / 10
              : 0,
          notifySamples: N_eff,
        });
      }
    }, dtBatch);

    const cleanup = () => clearInterval(id);
    CURRENT_UNSUB = cleanup;
    return cleanup;
  },
};

// Export both ways to avoid import mismatches
export default MockBle;
export const Ble = MockBle;

export { setLinkSim, setNextScanFail, setNextConnectFail, triggerDisconnectNow };
