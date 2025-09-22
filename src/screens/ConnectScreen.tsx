import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useDeviceStore } from '../store/deviceStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Connect'>;

const MOCK_DEVICE = {
  id: 'mock-strap-1',
  name: 'Mock Strap',
  rssi: -42,
  battery: 95,
};

export default function ConnectScreen({ navigation }: Props) {
  const dev = useDeviceStore();
  const set = useDeviceStore((s) => s.set);
  const reset = useDeviceStore((s) => s.reset);

  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setFound(false);
    setTimeout(() => {
      setFound(true);
      setScanning(false);
    }, 500);
  };

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      set({
        id: MOCK_DEVICE.id,
        name: MOCK_DEVICE.name,
        connected: true,
        rssi: MOCK_DEVICE.rssi,
        battery: MOCK_DEVICE.battery,
        mtuTarget: 247,
        mtuNegotiated: 247,
        notifySamples: 10,
        packetHz: 200,
        dropPct: 0,
      });
      setConnecting(false);
      navigation.goBack();
    }, 500);
  };

  const handleDisconnect = () => {
    reset();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Scanner</Text>

      <Button title={scanning ? 'Scanning…' : 'Scan'} onPress={handleScan} disabled={scanning} />

      {found ? (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#111827', marginTop: 8 }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>{MOCK_DEVICE.name}</Text>
          <Text style={{ color: 'white' }}>RSSI {MOCK_DEVICE.rssi} dBm</Text>
          <Text style={{ color: 'white' }}>Battery {MOCK_DEVICE.battery}%</Text>

          <View style={{ height: 8 }} />
          {dev.connected ? (
            <Button title="Disconnect" onPress={handleDisconnect} />
          ) : (
            <Button title={connecting ? 'Connecting…' : 'Connect'} onPress={handleConnect} disabled={connecting} />
          )}
        </View>
      ) : (
        !scanning && <Text style={{ color: '#6b7280' }}>No devices yet. Tap Scan.</Text>
      )}
    </View>
  );
}
