// src/components/StatusBadge.tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useDeviceStore } from '../store/deviceStore';

type Props = { onPress?: () => void };

export const StatusBadge: React.FC<Props> = ({ onPress }) => {
  const { connected, name, battery } = useDeviceStore();
  const label = connected ? `Connected • ${name ?? ''}`.trim() : 'Disconnected';

  return (
    <Pressable onPress={onPress} style={[styles.badge, connected ? styles.connected : styles.disconnected]} hitSlop={8}>
      <Text style={styles.text}>{label}</Text>
      {connected && typeof battery === 'number' && <Text style={[styles.text, styles.battery]}>{battery}%</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 12 },
  connected: { backgroundColor: '#16a34a' },
  disconnected: { backgroundColor: '#525252' },
  text: { color: 'white', fontSize: 14 },
  battery: { marginLeft: 8 },
});
