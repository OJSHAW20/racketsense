import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useDeviceStore } from '../store/deviceStore';
import { startRawRecording, stopRawRecording, shareFile } from '../services/export';

export default function DebugScreen() {
  const dev = useDeviceStore();
  const [recordPath, setRecordPath] = useState<string | null>(null);

  const begin = async () => {
    const p = await startRawRecording({ sport: 'tennis', deviceId: dev.id, strapTag: 'debug' });
    setRecordPath(p);
    Alert.alert('Recording started', p.split('/').slice(-1)[0]);
  };

  const end = async () => {
    const p = await stopRawRecording();
    if (p) {
      setRecordPath(null);
      Alert.alert('Recording stopped', p.split('/').slice(-1)[0]);
    }
  };

  const exportNow = async () => {
    if (!recordPath) {
      Alert.alert('Nothing to export', 'Start/stop a recording first.');
      return;
    }
    await shareFile(recordPath);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Debug</Text>

      {/* Controls */}
      <View style={styles.row}>
        <Button title={recordPath ? 'Recording…' : 'Start Record'} onPress={begin} disabled={!!recordPath} />
        <View style={{ width: 8 }} />
        <Button title="Stop" onPress={end} disabled={!recordPath} />
        <View style={{ width: 8 }} />
        <Button title="Export raw" onPress={exportNow} />
      </View>

      {/* Device card (yours) */}
      <View style={styles.card}>
        <Text style={styles.h2}>Device</Text>
        <Text>ID: {dev.id ?? '—'}</Text>
        <Text>Name: {dev.name ?? '—'}</Text>
        <Text>Connected: {dev.connected ? 'Yes' : 'No'}</Text>
        <Text>RSSI: {dev.rssi ?? '—'}</Text>
        <Text>Battery: {typeof dev.battery === 'number' ? `${dev.battery}%` : '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Link</Text>
        <Text>MTU (target/negotiated): {dev.mtuTarget ?? '—'} / {dev.mtuNegotiated ?? '—'}</Text>
        <Text>Samples/notify: {dev.notifySamples ?? '—'}</Text>
        <Text>Packet rate (Hz): {dev.packetHz ?? '—'}</Text>
        <Text>Drops (%): {dev.dropPct ?? '—'}</Text>
      </View>

      <Text style={styles.note}>Charts/controls will go here later.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: '700' },
  h2: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  card: { backgroundColor: '#111827', padding: 12, borderRadius: 12, gap: 4 },
  note: { color: '#6b7280', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
