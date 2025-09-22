// Bucket event timestamps into fixed bins.
// timesMs: array of event times (ms since session start)
export function bucketCounts(
    timesMs: number[],
    binSec = 5,
    startMs?: number,
    endMs?: number
  ) {
    if (timesMs.length === 0) return { bins: [], counts: [] as number[], binMs: binSec * 1000 };
  
    const binMs = Math.max(1000, Math.floor(binSec * 1000));
    const s = startMs ?? Math.min(...timesMs);
    const e = endMs ?? Math.max(...timesMs);
    const n = Math.max(1, Math.ceil((e - s) / binMs));
    const counts = new Array(n).fill(0);
  
    for (const t of timesMs) {
      const idx = Math.min(n - 1, Math.max(0, Math.floor((t - s) / binMs)));
      counts[idx] += 1;
    }
    const bins = Array.from({ length: n }, (_, i) => s + i * binMs);
    return { bins, counts, binMs };
  }
  