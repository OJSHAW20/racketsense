import React from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
  const { sport, durationMs, swings, maxRally, avgSpeed, maxSpeed, startedAtMs } = route.params;
  const add = useSessionStore(s => s.add);

  const handleSave = () => {
    const id = `sess-${startedAtMs}-${Math.floor(Math.random() * 1e6)}`;
    add({
      id,
      sport,
      dateMs: startedAtMs,
      durationMs,
      swings,
      maxRally,
      avgSpeed,
      maxSpeed,
    });
    navigation.navigate('History');
  };

  const handleDiscard = () => {
    navigation.popToTop();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>{sport} — Summary</Text>
      <Text>Duration: {Math.round(durationMs / 1000)} s</Text>
      <Text>Swings: {swings}</Text>
      <Text>Max rally: {maxRally}</Text>
      <Text>Avg speed: {avgSpeed.toFixed(2)} m/s</Text>
      <Text>Max speed: {maxSpeed.toFixed(2)} m/s</Text>

      <View style={{ height: 16 }} />

      <Button title="Save" onPress={handleSave} />
      <View style={{ height: 8 }} />
      <Button title="Discard" color="#cc0000" onPress={handleDiscard} />
    </View>
  );
}
