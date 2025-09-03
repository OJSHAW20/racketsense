import cfg from '../config/SPORT_CFG.json';

export type SportKey = 'tennis' | 'padel' | 'pickleball';
export type SportCfg = {
  rallyGapSec: number;
  accelHpHz: number;
  impactG: number;
  gyroPeakDps: number;
  radiusM: number;
  refractoryMs: number;
};

export function getCfg(sport: SportKey): SportCfg {
  const s = (cfg as any)[sport];
  if (!s) throw new Error(`SPORT_CFG missing sport: ${sport}`);
  // quick validation
  const keys = ['rallyGapSec','accelHpHz','impactG','gyroPeakDps','radiusM','refractoryMs'];
  keys.forEach(k => { if (typeof s[k] !== 'number') throw new Error(`SPORT_CFG.${sport}.${k} invalid`); });
  return s as SportCfg;
}
