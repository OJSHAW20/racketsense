import { MMKV } from 'react-native-mmkv';
const db = new MMKV();
export function getJSON<T>(key: string, fallback: T): T {
  const s = db.getString(key);
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}
export function setJSON(key: string, value: any) {
  db.set(key, JSON.stringify(value));
}
