// src/tests/env.test.ts

describe('env flags', () => {
    afterEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });
  
    it('uses defaults when extra is empty', () => {
      // Mock expo-constants for this test case
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { expoConfig: { extra: {} } },
      }));
  
      // Load env.ts in an isolated module context so the mock applies
      jest.isolateModules(() => {
        // Use require() to avoid dynamic import & VM modules
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('../config/env');
        expect(mod.QA_MODE_ENABLED).toBe(true);   // __DEV__ is true under Jest
        expect(mod.USE_MOCK_BLE).toBe(true);
        expect(mod.DEMO_SEED_ENABLED).toBe(false);
      });
    });
  
    it('respects overrides in extra', () => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: {
          expoConfig: {
            extra: {
              QA_MODE_ENABLED: false,
              USE_MOCK_BLE: false,
              DEMO_SEED_ENABLED: true,
              REAL_BLE: true,
            },
          },
        },
      }));
  
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('../config/env');
        expect(mod.QA_MODE_ENABLED).toBe(false);
        expect(mod.USE_MOCK_BLE).toBe(false); // REAL_BLE forces mock off
        expect(mod.DEMO_SEED_ENABLED).toBe(true);
      });
    });
  });
  