import { useEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import MockBle from './src/services/mockBle';
import { startSession, ingest, endSession } from './src/lib/metrics';
import { getCfg } from './src/lib/sportConfig';

export default function App() {
  const [swings, setSwings] = useState(0);
  const [rally, setRally] = useState(0);
  const [peak, setPeak] = useState(0);

  useEffect(() => {
    startSession(getCfg('tennis'), {
      onLiveUpdate: ({ swings, rally, peakSpeed }) => {
        setSwings(swings);
        setRally(rally);
        setPeak(peakSpeed);
      },
    });

    const unsub = MockBle.subscribeImu((batch) => {
      ingest(batch);
    });

    return () => {
      unsub();
      const summary = endSession();
      console.log('Session summary', summary);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ gap: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>RacketSense (Mock + Metrics)</Text>
        <Text>Swings: {swings}</Text>
        <Text>Current rally: {rally}</Text>
        <Text>Peak speed: {peak.toFixed(2)} m/s</Text>
      </View>
    </SafeAreaView>
  );
}
