import React from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSessionStore } from '../store/sessionStore';
import Sparkline from '../components/Sparkline';
import { bucketCounts } from '../lib/sparkline';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen({ route }: Props) {
  const { id } = route.params;
  const session = useSessionStore(s => s.sessions.find(x => x.id === id));

  if (!session) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>Session not found.</Text>
      </View>
    );
  }

  // --- TEMP: fake event times so sparkline has something to show ---
  // Distribute `swings` roughly over the duration with a bit of jitter.
  // Use session.id hash so it looks consistent across reloads.
  const durMs = Math.max(1, session.durationMs);
  const swings = Math.max(0, session.swings);

  // Simple deterministic RNG from the session.id
  const seed = Array.from(session.id).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 1);
  let s = seed;
  const rand = () => { s = (1664525 * s + 1013904223) >>> 0; return s / 0xffffffff; };

  // Create `swings` timestamps within [0, durMs)
  const fakeTimesMs = Array.from({ length: swings }, (_, i) => {
    const base = (i + 1) / (swings + 1);
    const jitter = (rand() - 0.5) * 0.04; // ±4%
    const t01 = Math.min(0.999, Math.max(0, base + jitter));
    return t01 * durMs;
  });

  // Bucket into 5s bins (expects seconds)
  const { counts } = bucketCounts(fakeTimesMs.map(t => t / 1000), 5);

  // ---- metadata line (add these right after the basic stats) ----
  // Access optional fields safely without changing global types.
  const sAny = session as any;
  const metaBits: string[] = [];
  if (sAny?.strapTag) metaBits.push(`Strap ${sAny.strapTag}`);
  if (sAny?.racket) metaBits.push(sAny.racket);
  if (sAny?.gripSize) metaBits.push(`Grip ${sAny.gripSize}`);
  if (typeof sAny?.overgrip === 'boolean') {
    metaBits.push(sAny.overgrip ? 'Overgrip: yes' : 'Overgrip: no');
  }

  return (
    <View style={{ flex:1, padding:16, gap:8 }}>
      <Text style={{ fontSize:20, fontWeight:'600' }}>
        {session.sport.toUpperCase()} • {new Date(session.dateMs).toLocaleString()}
      </Text>
      <Text>Duration: {Math.round(session.durationMs/1000)} s</Text>
      <Text>Swings: {session.swings}</Text>
      <Text>Max rally: {session.maxRally}</Text>
      <Text>Avg speed: {session.avgSpeed.toFixed(2)} m/s</Text>
      <Text>Max speed: {session.maxSpeed.toFixed(2)} m/s</Text>

      {metaBits.length > 0 && (
        <Text style={{ opacity: 0.7, marginTop: 6 }}>
          {metaBits.join(' · ')}
        </Text>
      )}
      {sAny?.notes ? (
        <Text style={{ opacity: 0.7, marginTop: 4 }}>
          Notes: {sAny.notes}
        </Text>
      ) : null}

      <View style={{ height: 16 }} />
      <Text style={{ opacity: 0.6, marginBottom: 6 }}>Activity over time</Text>
      <Sparkline counts={counts} />
    </View>
  );
}
