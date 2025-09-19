import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useDeviceStore } from '../store/deviceStore';

type Props = {
  onLongPress?: () => void; // we'll hook this to Debug later
};

export const StatusBadge: React.FC<Props> = ({ onLongPress }) => {
  // Adjust these keys to match your store exactly
  const { connected, name, battery } = useDeviceStore();

  const label = connected
    ? `Connected • ${name ?? ''}`.trim()
    : 'Disconnected';

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[styles.badge, connected ? styles.connected : styles.disconnected]}
      hitSlop={8}
    >
      <Text style={styles.text}>{label}</Text>
      {connected && typeof battery === 'number' && (
        <Text style={[styles.text, styles.battery]}>{battery}%</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  connected: { backgroundColor: '#16a34a' },   // green-600
  disconnected: { backgroundColor: '#525252' }, // gray-600
  text: { color: 'white', fontSize: 14 },
  battery: { marginLeft: 8 },
});
