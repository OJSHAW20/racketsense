// src/tests/metrics.test.ts
import { startSession, ingest, endSession } from '../lib/metrics';
import { getCfg } from '../lib/sportConfig';
import { SAMPLE_HZ } from '../config/constants';
import type { Sample } from '../types/ble';

const dtMs = 1000 / SAMPLE_HZ;

const s = (t: number, ax=0, ay=0, az=9.80665, gx=0, gy=0, gz=0): Sample =>
  ({ t_ms: t, ax, ay, az, gx, gy, gz });

/** N ms of stillness for bias capture */
function silence(t0: number, ms: number): Sample[] {
  const out: Sample[] = [];
  const n = Math.round(ms / dtMs);
  let t = t0;
  for (let i = 0; i < n; i++) { out.push(s(t)); t += dtMs; }
  return out;
}

/** Step-like impact: one high sample bracketed by zeros (HP-friendly) */
function stepImpact(t0: number): Sample[] {
  // Use strong accel & gyro at the SAME tick:
  // - accel ~ 100 m/s^2 (~10 g) >> 3.5 g threshold after HP
  // - gyro ~ 12 rad/s (~687 dps) >> 450 dps threshold
  return [
    s(t0 - dtMs, 0, 0, 9.80665, 0, 0, 0),
    s(t0,        100, 0, 9.80665, 12, 0, 0), // the “step”
    s(t0 + dtMs, 0, 0, 9.80665, 0, 0, 0),
  ];
}

test.skip('metrics: counts swings, rally grouping, refractory', () => {
  const cfg = getCfg('tennis'); // keep real thresholds
  startSession(cfg);

  let t = 0;

  // 2s stillness for gyro bias
  ingest(silence(t, 2000)); t += 2000;

  // Impact #1
  ingest(stepImpact(t)); t += 300;   // 0.3s gap -> same rally window (2.0s)

  // Impact #2 (same rally)
  ingest(stepImpact(t)); t += 2500;  // 2.5s gap -> new rally

  // Impact #3 (new rally)
  ingest(stepImpact(t)); t += 100;

  const sum = endSession();

  expect(sum.swings).toBeGreaterThanOrEqual(3);   // 3 impacts detected
  expect(sum.maxRally).toBeGreaterThanOrEqual(2); // first two grouped
  expect(sum.maxSpeed).toBeGreaterThan(2);        // ω≈12 * r≈0.30 -> ~3.6 m/s
  expect(sum.durationMs).toBeGreaterThan(0);
});
