export type Hp1State = { y: number; x: number };
export function hp1(x: number, state: Hp1State, dt: number, fc: number): number {
  // one-pole high-pass: y[n] = α ( y[n-1] + x[n] - x[n-1] )
  const rc = 1 / (2 * Math.PI * fc);
  const alpha = rc / (rc + dt);
  const y = alpha * (state.y + x - state.x);
  state.x = x; state.y = y;
  return y;
}

export type LpfState = { y: number };
export function lpf(x: number, state: LpfState, dt: number, fc: number): number {
  // one-pole low-pass (envelope-ish)
  const rc = 1 / (2 * Math.PI * fc);
  const alpha = dt / (rc + dt);
  const y = state.y + alpha * (x - state.y);
  state.y = y;
  return y;
}

export function rollingRms(buf: number[], window: number): number {
  if (buf.length === 0 || window <= 0) return 0;
  const n = Math.min(buf.length, window);
  let s = 0;
  for (let i = buf.length - n; i < buf.length; i++) s += buf[i] * buf[i];
  return Math.sqrt(s / n);
}
