// src/services/ble.ts
import MockBle from './mockBle';      // default import from your old mock

export const BLE = MockBle;           // facade the app uses
export type BleApi = typeof MockBle;

// Later for real hardware you’ll switch to:
// import { Ble as RealBle } from './ble.plx';
// export const BLE = USE_MOCK_BLE ? MockBle : RealBle;
