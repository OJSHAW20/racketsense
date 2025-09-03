import { ACC_MPS2_PER_LSB, GYRO_RAD_PER_LSB, BYTES_PER_SAMPLE } from '../config/constants';
import type { Sample } from '../types/ble';

export function parseImuNotification(u8: Uint8Array): Sample[] {
  const BPS = (typeof BYTES_PER_SAMPLE === 'number' && BYTES_PER_SAMPLE > 0) ? BYTES_PER_SAMPLE : 16;

  if (u8.byteLength % BPS !== 0) {
    if (__DEV__) console.warn('imuParser: unexpected length', u8.byteLength);
  }
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const n = Math.floor(u8.byteLength / BPS);
  const out: Sample[] = new Array(n);

  let off = 0;
  for (let i = 0; i < n; i++) {
    const t_ms  = dv.getUint32(off + 0,  true);
    const axLSB = dv.getInt16(off + 4,  true);
    const ayLSB = dv.getInt16(off + 6,  true);
    const azLSB = dv.getInt16(off + 8,  true);
    const gxLSB = dv.getInt16(off + 10, true);
    const gyLSB = dv.getInt16(off + 12, true);
    const gzLSB = dv.getInt16(off + 14, true);

    out[i] = {
      t_ms,
      ax: axLSB * ACC_MPS2_PER_LSB,
      ay: ayLSB * ACC_MPS2_PER_LSB,
      az: azLSB * ACC_MPS2_PER_LSB,
      gx: gxLSB * GYRO_RAD_PER_LSB,
      gy: gyLSB * GYRO_RAD_PER_LSB,
      gz: gzLSB * GYRO_RAD_PER_LSB,
    };
    off += BPS;
  }
  return out;
}

// keep the alias
export function parsePacket(u8: Uint8Array) {
  return parseImuNotification(u8);
}
