import Constants from 'expo-constants';

type Extra = Partial<{
  QA_MODE_ENABLED: boolean;
  USE_MOCK_BLE: boolean;
  DEMO_SEED_ENABLED: boolean;
  REAL_BLE: boolean; // convenience flag to force real BLE
}>;

/**
 * We read flags from Expo's config (app.json/app.config.* -> extra).
 * All flags have sane defaults so the app runs even if "extra" is empty.
 */
const extra: Extra = (Constants?.expoConfig?.extra ?? {}) as Extra;

// Default behaviors:
// - QA_MODE_ENABLED: on in dev builds
// - USE_MOCK_BLE: on in dev unless REAL_BLE is explicitly true
// - DEMO_SEED_ENABLED: off by default
const REAL_BLE = extra.REAL_BLE ?? false;

export const QA_MODE_ENABLED =
  extra.QA_MODE_ENABLED ?? (__DEV__ === true);

export const USE_MOCK_BLE =
  extra.USE_MOCK_BLE ?? ((__DEV__ === true) && !REAL_BLE);

export const DEMO_SEED_ENABLED =
  extra.DEMO_SEED_ENABLED ?? false;

// Optional: expose a tiny helper so you can quickly log current flags
export const ENV = {
  QA_MODE_ENABLED,
  USE_MOCK_BLE,
  DEMO_SEED_ENABLED,
  REAL_BLE,
} as const;
