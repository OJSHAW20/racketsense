import { SAMPLE_HZ, SAMPLES_PER_NOTIFY } from '../config/constants';
import type { DeviceInfo, ImuBatchHandler, Sample } from '../types/ble';

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
    const id = 'MOCK-IMU-001';
    let alive = true;
    setTimeout(() => {
      if (alive) onDevice({ id, name: 'RacketSense Mock', rssi: -45 });
    }, 300);
    return { stop: () => { alive = false; } };
  },

  async connect(id: string) {
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
    const dtBatch = dtSample * N;

    let t_ms = Date.now();

    if (__DEV__) console.log('[mockBle] subscribeImu start', { HZ, N, dtBatch });

    const makeBatch = (): Sample[] => {
      // pre-allocate so length is guaranteed to be N
      const batch: Sample[] = new Array(N);
      for (let i = 0; i < N; i++) {
        const t = t_ms;
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

      // occasional "impact" burst
    // HP-friendly impact: single-sample accel spike + strong gyro on same tick
    if (Math.random() < 0.25) {
        const axis = (['x','y','z'] as const)[Math.floor(Math.random() * 3)];
        const gyroPeak = 12 + Math.random() * 6; // 12–18 rad/s (>450 dps)
        const ACC_PULSE = 80;                    // ~8 g accel spike
        const mid = Math.max(1, Math.floor(N / 2)); // center of batch
        const shape = [0.0, 1.0, 0.0];              // three-sample step-like pulse
    
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
      if (__DEV__) console.log('[mockBle] emitting batch len=', batch.length);
      return batch;
    };

    if (__DEV__) console.log('[mockBle] subscribeImu start', { HZ, N, dtBatch });

    // emit immediately, then on a fixed cadence
    onBatch(makeBatch());
    const id = setInterval(() => {
      if (__DEV__) console.log('[mockBle] emitting batch len=', N);
      onBatch(makeBatch());
    }, dtBatch);

    return () => clearInterval(id);
  },
};

// Export both ways to avoid import mismatches
export default MockBle;
export const Ble = MockBle;