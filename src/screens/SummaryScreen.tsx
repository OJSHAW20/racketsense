import React from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSessionStore } from '../store/sessionStore';
import { useQaStore } from '../store/qaStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
  const { sport, durationMs, swings, maxRally, avgSpeed, maxSpeed, startedAtMs } = route.params;
  const add = useSessionStore(s => s.add);

  // pull values from qaStore
  const qa = useQaStore();

  // local state seeded from qa defaults
  const [strapTag, setStrapTag] = React.useState<string>(qa.strapTag);
  const [racket, setRacket] = React.useState<string>(qa.racket);
  const [gripSize, setGripSize] = React.useState<string>(qa.gripSize);
  const [overgrip, setOvergrip] = React.useState<boolean>(qa.overgrip);
  const [notes, setNotes] = React.useState<string>(qa.notes);

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
      // metadata pulled from state (initialized with qaStore defaults)
      strapTag,
      racket,
      gripSize,
      overgrip,
      notes,
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
      <Text style={{ marginTop: 12, fontWeight: '600' }}>Metadata</Text>
      <Text>Strap: {strapTag}</Text>
      <Text>Racket: {racket}</Text>
      <Text>Grip size: {gripSize}</Text>
      <Text>Overgrip: {overgrip ? 'yes' : 'no'}</Text>
      {!!notes && <Text>Notes: {notes}</Text>}

      <View style={{ height: 16 }} />

      <Button title="Save" onPress={handleSave} />
      <View style={{ height: 8 }} />
      <Button title="Discard" color="#cc0000" onPress={handleDiscard} />
    </View>
  );
}
