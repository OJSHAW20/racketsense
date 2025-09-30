import { startSession, ingest, endSession } from '../lib/metrics';
import { getCfg } from '../lib/sportConfig';
import type { Sample } from '../types/ble';
import { useSessionStore } from '../store/sessionStore';

function makeBurst(t_ms: number, ax: number, gx: number): Sample[] {
  // 5-sample micro-burst around t_ms (approx 200 Hz)
  const dt = 5; // ms
  const arr: Sample[] = [];
  for (let k = -2; k <= 2; k++) {
    arr.push({
      t_ms: t_ms + k * dt,
      ax: k === 0 ? ax : 0,
      ay: 0,
      az: 0,
      gx: k === 0 ? gx : 0,
      gy: 0,
      gz: 0,
    });
  }
  return arr;
}

test('Recording → Summary → Save flow adds a session to store', () => {
  // Clear existing sessions
  useSessionStore.setState({ sessions: [] });

  const sport: 'tennis' = 'tennis';
  const cfg = getCfg(sport);

  // Start session
  startSession(cfg, {}, sport);

  // Synthetic timeline (~200 Hz timestamps)
  const t0 = 1_700_000_000_000;
  const batch1 = makeBurst(t0 + 2300, cfg.impactG * 9.80665 * 1.5, cfg.gyroPeakDps * Math.PI / 180 * 1.5);
  const batch2 = makeBurst(t0 + 2600, cfg.impactG * 9.80665 * 1.5, cfg.gyroPeakDps * Math.PI / 180 * 1.5);


  ingest(batch1);
  ingest(batch2);

  const summary = endSession();

  // Mimic SummaryScreen "Save"
  const id = `test-${Date.now()}`;
  useSessionStore.getState().add({
    id,
    sport: summary.sport,
    dateMs: summary.startedAtMs,
    durationMs: summary.durationMs,
    swings: summary.swings,
    maxRally: summary.maxRally,
    avgSpeed: summary.avgSpeed,
    maxSpeed: summary.maxSpeed,
    // minimal metadata (would normally come from qaStore/summary UI)
    strapTag: 'Test-Strap',
  });

  const sessions = useSessionStore.getState().sessions;
  expect(sessions.length).toBe(1);
  expect(sessions[0].swings).toBeGreaterThanOrEqual(2);
  expect(sessions[0].maxRally).toBeGreaterThanOrEqual(2);
  expect(sessions[0].strapTag).toBe('Test-Strap');
});
