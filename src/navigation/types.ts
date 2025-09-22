// src/navigation/types.ts
export type RootStackParamList = {
    Home: undefined;
    Recording: { sport: string };
    Summary: {
      sport: string;
      durationMs: number;
      swings: number;
      maxRally: number;
      avgSpeed: number;
      maxSpeed: number;
      startedAtMs: number;
    };
    History: undefined;
    SessionDetail: { id: string };
    Debug: undefined;
    Connect: undefined;
  };
  