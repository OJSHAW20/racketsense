// __mocks__/react-native-mmkv.ts
type Store = Record<string, string>;
const mem: Store = {};

export class MMKV {
  getString(key: string): string | undefined { return mem[key]; }
  set(key: string, value: string) { mem[key] = value; }
  delete(key: string) { delete mem[key]; }
  // minimal surface for our wrapper
}
export default { MMKV };
