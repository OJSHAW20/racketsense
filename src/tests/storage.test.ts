import { getJSON, setJSON } from '../services/storage';

test('storage: setJSON/getJSON round trip', () => {
  const key = 'test/key';
  const value = { a: 1, b: 'two' };
  setJSON(key, value);
  const out = getJSON<typeof value>(key, { a: 0, b: '' });
  expect(out).toEqual(value);
});

test('storage: fallback when missing', () => {
  const out = getJSON('missing/key', { ok: true });
  expect(out).toEqual({ ok: true });
});
