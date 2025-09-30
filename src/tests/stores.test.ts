import { useSessionStore } from '../store/sessionStore';
import { useDeviceStore } from '../store/deviceStore';
import { useUiStore } from '../store/uiStore';
import { useQaStore } from '../store/qaStore';
import { getJSON, del } from '../services/storage';

type SavedSession = {
    id: string;
    sport: string;
    dateMs: number;
    durationMs: number;
    swings: number;
    maxRally: number;
    avgSpeed: number;
    maxSpeed: number;
  };
  

const SESS_KEY = 'sessions/v1';

function makeSession() {
  const now = Date.now();
  return {
    id: 'test-1',
    sport: 'tennis',
    dateMs: now,
    durationMs: 12345,
    swings: 7,
    maxRally: 3,
    avgSpeed: 2.5,
    maxSpeed: 4.2,
  };
}

beforeEach(() => {
  // clear persisted sessions between tests
  del(SESS_KEY);
});

test('sessionStore: add() pushes and persists', () => {
  const s = makeSession();
  const { add } = useSessionStore.getState();
  add(s);

  const sessions = useSessionStore.getState().sessions;
  expect(sessions.length).toBeGreaterThanOrEqual(1);
  expect(sessions[0].id).toBe('test-1');

  // persisted to storage
  const persisted = getJSON<SavedSession[]>(SESS_KEY, []);
  expect(persisted.length).toBeGreaterThanOrEqual(1);
  expect(persisted[0].id).toBe('test-1');
});

test('deviceStore: set() updates fields', () => {
  const { set } = useDeviceStore.getState();
  set({ connected: true, id: 'MOCK-IMU-001', name: 'RacketSense Mock', rssi: -44, battery: 95 });
  const st = useDeviceStore.getState();
  expect(st.connected).toBe(true);
  expect(st.id).toBe('MOCK-IMU-001');
  expect(st.battery).toBe(95);
});

// uiStore test — update names to selectedSport/setSelectedSport
test('uiStore: setSelectedSport updates selectedSport', () => {
  const { setSelectedSport } = useUiStore.getState();
  setSelectedSport('tennis');
  expect(useUiStore.getState().selectedSport).toBe('tennis');
});

// qaStore test — use explicit setters
test('qaStore: setters update fields', () => {
  const { setStrapTag, setOvergrip } = useQaStore.getState();
  setStrapTag('B');
  setOvergrip(true);
  const st = useQaStore.getState();
  expect(st.strapTag).toBe('B');
  expect(st.overgrip).toBe(true);
});
