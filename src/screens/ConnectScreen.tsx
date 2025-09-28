import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useDeviceStore } from '../store/deviceStore';
import { MockBle, setLinkSim } from '../services/mockBle';

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

  const handleScan = async () => {
    setScanning(true);
    setFound(false);

    // Use the mock BLE scanner
    const sub = await MockBle.startScan(() => {
      setFound(true);
      setScanning(false);
    });

    // Auto-stop scan after a few seconds (ensures scanning UI turns off even on failure)
    setTimeout(() => {
      sub.stop();
      setScanning(false);
    }, 3000);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await MockBle.connect(MOCK_DEVICE.id);

      // Mark connected; link stats come from the simulator
      set({
        id: MOCK_DEVICE.id,
        name: MOCK_DEVICE.name,
        connected: true,
        rssi: MOCK_DEVICE.rssi,
        battery: MOCK_DEVICE.battery,
      });

      // Good-link defaults; tweak during testing if needed
      setLinkSim({ mtu: 247, samplesPerNotify: 10, dropEveryN: 0 });
      navigation.goBack();
    } catch (e: any) {
      console.warn('Connect failed:', e);
      Alert.alert('Connect failed', e?.message ?? 'Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    reset();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Scanner</Text>

      <Button
        title={scanning ? 'Scanning…' : 'Scan'}
        onPress={handleScan}
        disabled={scanning}
      />

      {found ? (
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#111827',
            marginTop: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {MOCK_DEVICE.name}
          </Text>
          <Text style={{ color: 'white' }}>RSSI {MOCK_DEVICE.rssi} dBm</Text>
          <Text style={{ color: 'white' }}>Battery {MOCK_DEVICE.battery}%</Text>

          <View style={{ height: 8 }} />
          {dev.connected ? (
            <Button title="Disconnect" onPress={handleDisconnect} />
          ) : (
            <Button
              title={connecting ? 'Connecting…' : 'Connect'}
              onPress={handleConnect}
              disabled={connecting}
            />
          )}
        </View>
      ) : (
        !scanning && <Text style={{ color: '#6b7280' }}>No devices yet. Tap Scan.</Text>
      )}
    </View>
  );
}
