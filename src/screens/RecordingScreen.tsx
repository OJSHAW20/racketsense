import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { BLE } from '../services/ble';
import { startSession, ingest, endSession } from '../lib/metrics';
import { getCfg } from '../lib/sportConfig';
import type { Sample } from '../types/ble';

type Props = NativeStackScreenProps<RootStackParamList, 'Recording'>;

export default function RecordingScreen({ route, navigation }: Props) {
  const { sport } = route.params as { sport: 'tennis' | 'padel' | 'pickleball' };
  const [swings, setSwings] = useState(0);
  const [rally, setRally] = useState(0);
  const [peak, setPeak] = useState(0);
  const [startedAtMs] = useState(() => Date.now());

  useEffect(() => {

    startSession(getCfg(sport), {
      onLiveUpdate: ({ swings, rally, peakSpeed }) => {
        setSwings(swings);
        setRally(rally);
        setPeak(peakSpeed);
      },

      
    });

    const unsub = BLE.subscribeImu((batch: Sample[]) => ingest(batch));
    return () => { unsub(); };
  }, [sport]);

  const end = () => {
    const summary = endSession();
    navigation.replace('Summary', {
      sport,
      startedAtMs,
      durationMs: summary.durationMs,
      swings: summary.swings,
      maxRally: summary.maxRally,
      avgSpeed: summary.avgSpeed,
      maxSpeed: summary.maxSpeed,
    });
  };

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:10 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>Recording • {sport.toUpperCase()}</Text>
      <Text>Swings: {swings}</Text>
      <Text>Current rally: {rally}</Text>
      <Text>Peak speed: {peak.toFixed(2)} m/s</Text>
      <Button title="End Session" color="#cc0000" onPress={end} />
    </View>
  );
}
