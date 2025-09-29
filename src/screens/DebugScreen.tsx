import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useDeviceStore } from '../store/deviceStore';
import { startRawRecording, stopRawRecording, shareFile } from '../services/export';
import { TextInput, Switch, TouchableOpacity } from 'react-native';
import { useQaStore } from '../store/qaStore';
import { exportAllSummariesCsv } from '../services/export';

export default function DebugScreen() {
  const dev = useDeviceStore();
  const [recordPath, setRecordPath] = useState<string | null>(null);
  const [lastRawPath, setLastRawPath] = useState<string | null>(null);

  const begin = async () => {
    const p = await startRawRecording({
      sport: 'tennis',
      deviceId: dev.id,
      strapTag: useQaStore.getState().strapTag, // tag file with current strap
    });
    setRecordPath(p);
    setLastRawPath(null);
    Alert.alert('Recording started', p.split('/').slice(-1)[0]);
  };

  const end = async () => {
    const p = await stopRawRecording();
    if (p) {
      setRecordPath(null);
      setLastRawPath(p);
      Alert.alert('Recording stopped', p.split('/').slice(-1)[0]);
    }
  };

  const exportNow = async () => {
    if (!lastRawPath) {
      Alert.alert('Nothing to export', 'Start/stop a recording first.');
      return;
    }
    await shareFile(lastRawPath);
  };

  const exportCsv = async () => {
    const p = await exportAllSummariesCsv({ share: true });
    Alert.alert('CSV exported', p.split('/').slice(-1)[0]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Debug</Text>

      {/* Controls */}
        <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
    <Button title={recordPath ? 'RAW: recording…' : 'RAW: Start'} onPress={begin} disabled={!!recordPath} />
    <View style={{ width: 8 }} />
    <Button title="RAW: Stop" onPress={end} disabled={!recordPath} />
    <View style={{ width: 8 }} />
    <Button title="RAW: Share .jsonl" onPress={exportNow} disabled={!lastRawPath} />
    <View style={{ width: 8 }} />
    <Button title="SUM: Export CSV" onPress={exportCsv} />
  </ScrollView>

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

      {/* Metadata defaults */}
      <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 12 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Metadata defaults</Text>
        <Text style={{ opacity: 0.7, marginBottom: 6 }}>Used to pre-fill Summary after recording</Text>

        {/** Subscribe to store so value + setter re-render properly */}
        {/* Strap tag */}
        <Text style={{ marginTop: 8 }}>Strap tag</Text>
        <TextInput
          value={useQaStore(s => s.strapTag)}
          onChangeText={useQaStore.getState().setStrapTag}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8 }}
        />

        {/* Racket */}
        <Text style={{ marginTop: 8 }}>Racket</Text>
        <TextInput
          value={useQaStore(s => s.racket)}
          onChangeText={useQaStore.getState().setRacket}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8 }}
        />

        {/* Grip size */}
        <Text style={{ marginTop: 8 }}>Grip size</Text>
        <TextInput
          value={useQaStore(s => s.gripSize)}
          onChangeText={useQaStore.getState().setGripSize}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8 }}
        />

        {/* Overgrip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Switch
            value={useQaStore(s => s.overgrip)}
            onValueChange={useQaStore.getState().setOvergrip}
          />
          <Text>Overgrip</Text>
        </View>

        {/* Notes */}
        <Text style={{ marginTop: 8 }}>Notes</Text>
        <TextInput
          value={useQaStore(s => s.notes)}
          onChangeText={useQaStore.getState().setNotes}
          placeholder="Optional notes for this A/B run"
          multiline
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minHeight: 60 }}
        />

        {/* Quick presets */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {['Strap-A', 'Strap-B', 'Silicone-A', 'Velcro-B', 'Elastic-C'].map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => useQaStore.getState().setStrapTag(label)}
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 20 }}
            >
              <Text>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: '700' },
  h2: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  card: { backgroundColor: '#e6f5ff', padding: 12, borderRadius: 12, gap: 4 },
  note: { color: '#6b7280', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

