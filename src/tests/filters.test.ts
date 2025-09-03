import { hp1, lpf } from '../lib/filters';
test('hp1 basic', ()=>{ const s={y:0,x:0}; expect(typeof hp1(1,s,0.01,2)).toBe('number'); });
test('lpf basic', ()=>{ const s={y:0}; expect(typeof lpf(1,s,0.01,2)).toBe('number'); });
