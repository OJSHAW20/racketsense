// tests/metrics.test.ts
import { startSession, ingest, endSession } from '../lib/metrics';
import { getCfg } from '../lib/sportConfig';
import type { Sample } from '../types/ble';
// Helper: build a deterministic stream at SAMPLE_HZ with chosen impact times.
function synthStream(params: {
  startMs?: number;
  durationMs: number;
  hz: number;
  sport: 'tennis' | 'padel' | 'pickleball';
  impactsMs: number[]; // times (ms since start) to trigger an impact
  // scales for how hard the impact is relative to thresholds
  accMult?: number; // >=1
  gyroMult?: number; // >=1
}): Sample[] {
  const {
    startMs = 1_700_000_000_000, // fixed epoch for determinism
    durationMs,
    hz,
    sport,
    impactsMs,
    accMult = 1.3,
    gyroMult = 1.3,
  } = params;

  const cfg = getCfg(sport);
  const dt = 1000 / hz;
  const n = Math.floor(durationMs / dt);
  const samples: Sample[] = [];

  const G = 9.80665;
  const RAD_PER_DPS = Math.PI / 180;

  // thresholds from cfg
  const accThresh = cfg.impactG * G;            // m/s^2
  const dpsThresh = cfg.gyroPeakDps;            // deg/s
  const wThresh = dpsThresh * RAD_PER_DPS;      // rad/s

  // For each impact time, we’ll make a small 3-sample “burst”
  const burstWin = 2; // samples on each side of the center where we add signal

  const impactSet = new Set(impactsMs.map(t => Math.round(t / dt)));

  for (let i = 0; i < n; i++) {
    const t_ms = startMs + Math.round(i * dt);

    // baseline “quiet”
    let ax = 0, ay = 0, az = 0;
    let gx = 0, gy = 0, gz = 0;

    // if near an impact index, inject accel + gyro energy
    for (const centerIdx of impactSet) {
      if (Math.abs(i - centerIdx) <= burstWin) {
        // accel: single-axis spike (HP filter will let transients through)
        ax = accThresh * accMult;
        // gyro: magnitude above threshold focused on x
        gx = wThresh * gyroMult;
      }
    }

    samples.push({ t_ms, ax, ay, az, gx, gy, gz });
  }

  return samples;
}

// Feed in chunks (to emulate BLE notifications)
function feedInChunks(all: Sample[], chunkSize = 25) {
  for (let i = 0; i < all.length; i += chunkSize) {
    ingest(all.slice(i, i + chunkSize));
  }
}

beforeEach(() => {
  // Mute noisy logs from metrics during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  (console.log as jest.Mock)?.mockRestore?.();
});

describe('metrics engine — deterministic synthetic tests', () => {
  test('counts two impacts separated by > refractory as one rally of 2', () => {
    const sport: 'tennis' = 'tennis';
    const cfg = getCfg(sport);
    const hz = 200;
    const refractory = cfg.refractoryMs; // e.g. 150 ms

    // Two impacts 300 ms apart (greater than refractory), within rally window
    const impactsMs = [1000, 1300];

    const stream = synthStream({
      durationMs: 2000,
      hz,
      sport,
      impactsMs,
    });

    startSession(cfg, {}, sport);
    feedInChunks(stream, 40);
    const summary = endSession();

    expect(summary.swings).toBe(2);
    expect(summary.maxRally).toBe(2);
    // duration close to total stream time
    expect(Math.round(summary.durationMs / 100) * 100).toBeGreaterThanOrEqual(1900);
  });

  test('second burst inside refractory is ignored (no double count)', () => {
    const sport: 'tennis' = 'tennis';
    const cfg = getCfg(sport);
    const hz = 200;
    const refractory = cfg.refractoryMs; // e.g. 150 ms

    // Two spikes only 50 ms apart (should be treated as one impact)
    const impactsMs = [1000, 1050];

    const stream = synthStream({
      durationMs: 1600,
      hz,
      sport,
      impactsMs,
    });

    startSession(cfg, {}, sport);
    feedInChunks(stream, 25);
    const summary = endSession();

    expect(summary.swings).toBe(1);
    expect(summary.maxRally).toBe(1);
  });

  test('speed is derived from gyro magnitude and radius (rough bounds)', () => {
    const sport: 'tennis' = 'tennis';
    const cfg = getCfg(sport);
    const hz = 200;

    // Single clear impact
    const impactsMs = [1000];

    const stream = synthStream({
      durationMs: 1500,
      hz,
      sport,
      impactsMs,
      gyroMult: 1.6, // a bit above threshold → ensures detectable peak
    });

    startSession(cfg, {}, sport);
    feedInChunks(stream, 50);
    const summary = endSession();

    // Expect at least 1 swing and a positive max speed
    expect(summary.swings).toBe(1);
    expect(summary.maxSpeed).toBeGreaterThan(0);

    // Max speed ≈ ω * r, where ω was set ~ (gyroMult * dpsThresh) in rad/s
    const RAD_PER_DPS = Math.PI / 180;
    const expectedW = cfg.gyroPeakDps * RAD_PER_DPS * 1.6;
    const rough = expectedW * cfg.radiusM;

    // Allow generous tolerance because filters/biasing affect peak capture
    expect(summary.maxSpeed).toBeGreaterThan(rough * 0.5);
    expect(summary.maxSpeed).toBeLessThan(rough * 2.0);
  });
});
