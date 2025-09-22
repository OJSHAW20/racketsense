import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { BLE } from './ble';
import type { Sample } from '../types/ble';

type ActiveRec = {
  fileName: string;
  path: string;            // real path on native, pseudo "web://<name>" on web
  unsub?: () => void;
  buffer: string;          // always buffered; written (or downloaded) on stop
};

let active: ActiveRec | null = null;

function nowForName() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function buildName(opts: { sport: string; deviceId?: string; strapTag?: string }) {
  return `${opts.sport}_${opts.strapTag ?? 'untagged'}_${nowForName()}_${opts.deviceId ?? 'dev'}.raw.jsonl`;
}

/** Begin recording raw samples to JSONL; returns a path/pseudo-path. */
export async function startRawRecording(opts: {
  sport: string;
  deviceId?: string;
  strapTag?: string;
}) {
  if (active) await stopRawRecording();

  const fileName = buildName(opts);
  const isWeb = Platform.OS === 'web';
  const hasDir = !!FileSystem.documentDirectory;

  let path = `web://${fileName}`;
  if (!isWeb && hasDir) {
    const dir = `${FileSystem.documentDirectory}sessions/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    path = dir + fileName;
  }

  active = { fileName, path, buffer: '' };

  const unsub = BLE.subscribeImu((batch: Sample[]) => {
    if (!active) return;
    const lines =
      batch
        .map((s) =>
          JSON.stringify({
            t_ms: Math.round(s.t_ms),
            ax: +s.ax.toFixed(4),
            ay: +s.ay.toFixed(4),
            az: +s.az.toFixed(4),
            gx: +s.gx.toFixed(4),
            gy: +s.gy.toFixed(4),
            gz: +s.gz.toFixed(4),
          })
        )
        .join('\n') + '\n';
    active.buffer += lines;
  });

  active.unsub = unsub;
  return path;
}

/** Stop recording; write to disk on native or trigger download on web. Returns path/pseudo-path. */
export async function stopRawRecording() {
  if (!active) return null;
  active.unsub?.();

  const isWeb = Platform.OS === 'web';

  if (isWeb || !FileSystem.documentDirectory) {
    // Create a download immediately in the browser
    const blob = new Blob([active.buffer], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = active.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const p = active.path; // "web://<name>"
    active = null;
    return p;
  }

  // Native write once
  await FileSystem.writeAsStringAsync(active.path, active.buffer, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const p = active.path;
  active = null;
  return p;
}

/** Share a file (native only). On web this is a no-op and returns false. */
export async function shareFile(path: string) {
  if (Platform.OS === 'web') return false;
  const can = await Sharing.isAvailableAsync();
  if (!can) return false;
  await Sharing.shareAsync(path);
  return true;
}

/** Convenience: record for N ms then stop (+ share/native or download/web). */
export async function recordFor(durationMs: number, meta: { sport: string; deviceId?: string; strapTag?: string }) {
  const p = await startRawRecording(meta);
  setTimeout(async () => {
    const done = await stopRawRecording();
    if (done) await shareFile(done);
  }, durationMs);
  return p;
}
