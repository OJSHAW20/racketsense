// src/config/constants.ts

// === Device Contract (single source of truth) ===
export const ACC_FS_G = 16 as const;           // ±16 g
export const GYRO_FS_DPS = 2000 as const;      // ±2000 dps

export const SAMPLE_HZ = 200 as const;         // 200 Hz
export const SAMPLES_PER_NOTIFY = 10 as const; // 10 samples per BLE notification
export const BYTES_PER_SAMPLE = 16 as const;   // u32 + 6*i16 = 4 + 12 = 16 bytes
export const MTU_TARGET = 247 as const;

// 128-bit UUIDs (stable placeholders; adjust if firmware differs)
export const SERVICE_UUID   = '6f6d0001-0000-1000-8000-00805f9b34fb';
export const CTRL_CHAR_UUID = '6f6d0002-0000-1000-8000-00805f9b34fb';
export const IMU_CHAR_UUID  = '6f6d0003-0000-1000-8000-00805f9b34fb';
export const BATT_CHAR_UUID = '6f6d0004-0000-1000-8000-00805f9b34fb';

// Opcodes
export const OPCODES = {
  STOP: 0x00,
  START: 0x01,
  CALIBRATE: 0x02,
  SET_CFG: 0x03,
} as const;

// ---- LSB -> SI scales (computed to avoid typos) ----
export const G = 9.80665; // m/s^2
export const ACC_MPS2_PER_LSB: number = (ACC_FS_G * G) / 32768;                     // ≈ 0.0047884033
export const GYRO_RAD_PER_LSB: number = ((GYRO_FS_DPS * Math.PI) / 180) / 32768;    // ≈ 0.0010652644

// Version tag (for QA logs / exports)
export const CONTRACT_VERSION = 'step0-locked@200Hz-10spn-v1' as const;

// Optional default export (harmless, helps if anything imports default)
const _default = {
  ACC_FS_G,
  GYRO_FS_DPS,
  SAMPLE_HZ,
  SAMPLES_PER_NOTIFY,
  BYTES_PER_SAMPLE,
  MTU_TARGET,
  SERVICE_UUID,
  CTRL_CHAR_UUID,
  IMU_CHAR_UUID,
  BATT_CHAR_UUID,
  OPCODES,
  G,
  ACC_MPS2_PER_LSB,
  GYRO_RAD_PER_LSB,
  CONTRACT_VERSION,
} as const;

export default _default;
