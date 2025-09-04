import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import MockBle from '../services/mockBle';
import { startSession, ingest, endSession } from '../lib/metrics';
import { getCfg } from '../lib/sportConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Recording'>;

export default function RecordingScreen({ navigation }: Props) {
  const [swings, setSwings] = useState(0);
  const [rally, setRally] = useState(0);
  const [peak, setPeak] = useState(0);

  useEffect(() => {
    // Start a Tennis session for now
    startSession(getCfg('tennis'), {
      onLiveUpdate: ({ swings, rally, peakSpeed }) => {
        setSwings(swings);
        setRally(rally);
        setPeak(peakSpeed);
      },
    });

    const unsub = MockBle.subscribeImu((batch) => ingest(batch));
    return () => { unsub(); };
  }, []);

  const end = () => {
    const summary = endSession();
    navigation.replace('Summary', summary);
  };

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:10 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>Recording •</Text>
      <Text>Swings: {swings}</Text>
      <Text>Current rally: {rally}</Text>
      <Text>Peak speed: {peak.toFixed(2)} m/s</Text>
      <Button title="End Session" color="#cc0000" onPress={end} />
    </View>
  );
}
