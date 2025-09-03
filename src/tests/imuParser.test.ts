import { parseImuNotification, parsePacket } from '../lib/imuParser';
import { ACC_MPS2_PER_LSB, GYRO_RAD_PER_LSB } from '../config/constants';

function makePacket(): Uint8Array {
  // uint32 t_ms, int16 ax, ay, az, gx, gy, gz  (little-endian)
  const u8 = new Uint8Array(16);
  const dv = new DataView(u8.buffer);
  dv.setUint32(0, 1234, true);   // t_ms
  dv.setInt16(4,  1000, true);   // ax
  dv.setInt16(6,  -1000, true);  // ay
  dv.setInt16(8,  0, true);      // az
  dv.setInt16(10, 500, true);    // gx
  dv.setInt16(12, 0, true);      // gy
  dv.setInt16(14, -500, true);   // gz
  return u8;
}

test('imuParser: bytes → SI with correct t_ms (parseImuNotification)', () => {
  const out = parseImuNotification(makePacket());
  expect(out).toHaveLength(1);
  const s = out[0];
  expect(s.t_ms).toBe(1234);
  expect(s.ax).toBeCloseTo(1000 * ACC_MPS2_PER_LSB, 6);
  expect(s.ay).toBeCloseTo(-1000 * ACC_MPS2_PER_LSB, 6);
  expect(s.az).toBeCloseTo(0, 6);
  expect(s.gx).toBeCloseTo(500 * GYRO_RAD_PER_LSB, 6);
  expect(s.gy).toBeCloseTo(0, 6);
  expect(s.gz).toBeCloseTo(-500 * GYRO_RAD_PER_LSB, 6);
});

test('imuParser: alias parsePacket returns identical result', () => {
  const a = parseImuNotification(makePacket());
  const b = parsePacket(makePacket());
  expect(b).toEqual(a);
});
