// scripts/replay.mock.ts
//
// Usage:
//   npx ts-node scripts/replay.mock.ts --file /path/to/file.raw.jsonl --sport tennis
//
// Reads raw JSONL (t_ms, ax, ay, az, gx, gy, gz), feeds metrics, prints a summary.
/// <reference types="node" />

import * as fs from 'fs';
import * as readline from 'readline';

// Adjust import paths if your folders differ
import { startSession, ingest, endSession } from '../src/lib/metrics';
import { getCfg } from '../src/lib/sportConfig';
import type { Sample } from '../src/types/ble';

type Args = { file: string; sport: 'tennis' | 'padel' | 'pickleball' };

function parseArgs(): Args {
  const idx = (flag: string) => {
    const i = process.argv.indexOf(flag);
    return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : '';
  };
  const file = parseFlag('--file') || parseFlag('-f');
  const sport = (parseFlag('--sport') || 'tennis') as Args['sport'];

  function parseFlag(f: string) {
    const i = process.argv.indexOf(f);
    return i >= 0 ? process.argv[i + 1] : '';
  }

  if (!file) {
    console.error('Error: --file /path/to/file.raw.jsonl is required');
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error('Error: file not found:', file);
    process.exit(1);
  }
  return { file, sport };
}

async function main() {
  const { file, sport } = parseArgs();
  const cfg = getCfg(sport);

  // Start metrics session (no callbacks needed for CLI)
  startSession(cfg, {}, sport);

  const rl = readline.createInterface({
    input: fs.createReadStream(file, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  // Stream in batches to mimic app ingestion
  const batch: Sample[] = [];
  const BATCH_SIZE = 50;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Each line is a sample JSON
    let s: any;
    try {
      s = JSON.parse(trimmed);
    } catch {
      continue;
    }

    // Coerce to Sample
    const sample: Sample = {
      t_ms: Number(s.t_ms),
      ax: Number(s.ax), ay: Number(s.ay), az: Number(s.az),
      gx: Number(s.gx), gy: Number(s.gy), gz: Number(s.gz),
    };
    batch.push(sample);

    if (batch.length >= BATCH_SIZE) {
      ingest(batch.splice(0, batch.length));
    }
  }
  if (batch.length) ingest(batch);

  const summary = endSession();

  // One-liner + JSON dump (easy to diff across runs)
  const secs = Math.round(summary.durationMs / 1000);
  console.log(
    `[replay] ${sport}  duration=${secs}s  swings=${summary.swings}  maxRally=${summary.maxRally}  avgSpeed=${summary.avgSpeed.toFixed(
      3
    )}  maxSpeed=${summary.maxSpeed.toFixed(3)}`
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
