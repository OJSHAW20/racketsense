// src/services/storage.ts
// Sync storage wrapper with MMKV when available; memory fallback in Expo Go.

let mmkv: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV();
} catch (e) {
  // Expo Go doesn't bundle MMKV -> fall back to memory
  if (__DEV__) console.warn('[storage] MMKV unavailable, using in-memory store (no persistence across reloads).');
}

// simple in-memory mirror for Expo Go
const mem = new Map<string, string>();

function setStr(key: string, value: string) {
  if (mmkv) mmkv.set(key, value);
  else mem.set(key, value);
}
function getStr(key: string): string | undefined {
  if (mmkv) return mmkv.getString(key) ?? undefined;
  return mem.get(key);
}
function delStr(key: string) {
  if (mmkv) mmkv.delete(key);
  else mem.delete(key);
}

export function setJSON(key: string, value: unknown) {
  try {
    setStr(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  const s = getStr(key);
  if (s == null) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function del(key: string) {
  delStr(key);
}
