// src/lib/metrics.ts
import type { Sample } from '../types/ble';
import type { SportCfg } from './sportConfig';
import { hp1, Hp1State, lpf, LpfState } from './filters';
import { SAMPLE_HZ } from '../config/constants';

const G = 9.80665;
const RAD_TO_DPS = 180 / Math.PI;

export type SessionSummary = {
  sport: string;
  durationMs: number;
  swings: number;
  maxRally: number;
  avgSpeed: number;
  maxSpeed: number;
  startedAtMs: number;
};

type Callbacks = {
  onLiveUpdate?: (s: { swings: number; rally: number; peakSpeed: number }) => void;
  onEvent?: (e: { t_ms: number; speed: number }) => void; // optional QA hook
};

type State = {
  cfg: SportCfg | null;
  sport: string;
  startedAtMs: number;
  lastTs: number;
  prevTs: number; // for per-sample dt
  // detection
  hpA: { x: Hp1State; y: Hp1State; z: Hp1State };
  envGyro: LpfState;
  gyroBias: { x: number; y: number; z: number };
  biasN: number;
  calibrating: boolean;
  calibUntilMs: number;
  refractoryUntil: number;
  // tallies
  swings: number;
  rally: number;
  maxRally: number;
  sumSpeed: number;
  nSpeed: number;
  peakSpeed: number;
  lastImpactMs: number;
  // callbacks
  cbs: Callbacks;
};

const S: State = {
  cfg: null,
  sport: 'tennis',
  startedAtMs: 0,
  lastTs: 0,
  prevTs: 0,
  hpA: { x: { y: 0, x: 0 }, y: { y: 0, x: 0 }, z: { y: 0, x: 0 } },
  envGyro: { y: 0 },
  gyroBias: { x: 0, y: 0, z: 0 },
  biasN: 0,
  calibrating: true,
  calibUntilMs: 0,
  refractoryUntil: 0,
  swings: 0,
  rally: 0,
  maxRally: 0,
  sumSpeed: 0,
  nSpeed: 0,
  peakSpeed: 0,
  lastImpactMs: 0,
  cbs: {},
};

export function startSession(cfg: SportCfg, cbs?: Callbacks, sportName = 'tennis') {
  S.cfg = cfg;
  S.cbs = cbs ?? {};
  S.sport = sportName;

  S.startedAtMs = 0;
  S.lastTs = 0;
  S.prevTs = 0;

  S.hpA = { x: { y: 0, x: 0 }, y: { y: 0, x: 0 }, z: { y: 0, x: 0 } };
  S.envGyro = { y: 0 };
  S.gyroBias = { x: 0, y: 0, z: 0 };
  S.biasN = 0;
  S.calibrating = true;
  S.calibUntilMs = 0;
  S.refractoryUntil = 0;

  S.swings = 0;
  S.rally = 0;
  S.maxRally = 0;
  S.sumSpeed = 0;
  S.nSpeed = 0;
  S.peakSpeed = 0;
  S.lastImpactMs = 0;
}

export function ingest(samples: Sample[]) {
  if (!S.cfg || samples.length === 0) return;

  if (S.startedAtMs === 0) {
    S.startedAtMs = samples[0].t_ms;
    S.prevTs = samples[0].t_ms;
    S.calibUntilMs = S.startedAtMs + 2000; // 2s stillness window
  }

  const accThresh = S.cfg.impactG * G;
  const gyroPeakDpsThresh = S.cfg.gyroPeakDps;
  const rallyGapMs = S.cfg.rallyGapSec * 1000;
  const refractoryMs = S.cfg.refractoryMs;

  // sensible dt bounds (seconds)
  const dtNom = 1 / (SAMPLE_HZ || 200);
  const dtMin = dtNom / 3;
  const dtMax = dtNom * 3;

  for (const s of samples) {
    S.lastTs = s.t_ms;

    // per-sample dt from timestamps (ms -> s), with clamping
    let dt = (s.t_ms - S.prevTs) / 1000;
    if (!isFinite(dt) || dt <= 0) dt = dtNom;
    dt = Math.max(dtMin, Math.min(dtMax, dt));

    // --- Gyro bias during calibration (first 2s) ---
    if (S.calibrating) {
      if (s.t_ms <= S.calibUntilMs) {
        S.biasN++;
        const k = 1 / S.biasN;
        S.gyroBias.x = (1 - k) * S.gyroBias.x + k * s.gx;
        S.gyroBias.y = (1 - k) * S.gyroBias.y + k * s.gy;
        S.gyroBias.z = (1 - k) * S.gyroBias.z + k * s.gz;
      } else {
        S.calibrating = false;
      }
    }

    // --- High-pass accel (per-axis), then magnitude ---
    const axh = hp1(s.ax, S.hpA.x, dt, S.cfg.accelHpHz);
    const ayh = hp1(s.ay, S.hpA.y, dt, S.cfg.accelHpHz);
    const azh = hp1(s.az, S.hpA.z, dt, S.cfg.accelHpHz);
    const aHpMag = Math.sqrt(axh * axh + ayh * ayh + azh * azh);

    // --- Gyro magnitude (bias-corrected) ---
    const gx = s.gx - S.gyroBias.x;
    const gy = s.gy - S.gyroBias.y;
    const gz = s.gz - S.gyroBias.z;
    const wMag = Math.sqrt(gx * gx + gy * gy + gz * gz); // rad/s
    const wDps = wMag * RAD_TO_DPS;                      // dps
    const speed = wMag * S.cfg.radiusM;                  // m/s (≈ ωr)

    // Optional: low-pass envelope for QA
    lpf(wMag, S.envGyro, dt, 5);

    const now = s.t_ms;
    const passedRefractory = now >= S.refractoryUntil;
    const isImpact = aHpMag >= accThresh && wDps >= gyroPeakDpsThresh;

    if (passedRefractory && isImpact) {
      // rally grouping
      if (S.lastImpactMs && now - S.lastImpactMs <= rallyGapMs) {
        S.rally += 1;
      } else {
        S.rally = 1;
      }
      if (S.rally > S.maxRally) S.maxRally = S.rally;

      S.swings += 1;
      S.sumSpeed += speed;
      S.nSpeed += 1;
      if (speed > S.peakSpeed) S.peakSpeed = speed;

      S.lastImpactMs = now;
      S.refractoryUntil = now + refractoryMs;

      S.cbs.onEvent?.({ t_ms: now, speed });
      S.cbs.onLiveUpdate?.({ swings: S.swings, rally: S.rally, peakSpeed: S.peakSpeed });
    }

    S.prevTs = s.t_ms;
  }
}

export function endSession(): SessionSummary {
  const durationMs = Math.max(0, S.lastTs - S.startedAtMs);
  const avgSpeed = S.nSpeed ? S.sumSpeed / S.nSpeed : 0;
  return {
    sport: S.sport,
    durationMs,
    swings: S.swings,
    maxRally: S.maxRally,
    avgSpeed,
    maxSpeed: S.peakSpeed,
    startedAtMs: S.startedAtMs,
  };
}
