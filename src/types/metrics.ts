export type Event = { t_ms: number; speed: number };
export type Rally = { count: number; maxSpeed: number };
export type SessionSummary = {
  sport: string; durationMs: number; swings: number; maxRally: number; avgSpeed: number; maxSpeed: number; startedAtMs: number;
};
