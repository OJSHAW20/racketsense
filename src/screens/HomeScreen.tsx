// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { StatusBadge } from '../components/StatusBadge';
import { useUiStore } from '../store/uiStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const SPORTS = ['tennis', 'padel', 'pickleball'] as const;
type Sport = typeof SPORTS[number];

export default function HomeScreen({ navigation }: Props) {
  const sport = useUiStore((s) => s.selectedSport);
  const setSport = useUiStore((s) => s.setSelectedSport);

  return (
    <View style={{ flex: 1 }}>
      {/* temporary: DEBUG button can stay for now */}
      <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 1000 }}>
        <Button title="DEBUG" onPress={() => navigation.navigate('Debug')} />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '600' }}>RacketSense</Text>
        <StatusBadge onPress={() => navigation.navigate('Connect')} />

        {/* New sport selector block */}
        <Text>Select a sport:</Text>
        <View style={{ width: '100%', marginTop: 8 }}>
          {SPORTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSport(s)}
              style={{
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#e5e5e5',
                marginBottom: 10,
                backgroundColor: sport === s ? '#f2f2f2' : 'white',
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                {s.toUpperCase()}
              </Text>
              <Text style={{ opacity: 0.6 }}>Tap to select</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text>{sport ? `Selected: ${sport}` : 'None selected'}</Text>

        <View style={{ height: 8 }} />
        <Button
          title="Start Session"
          disabled={!sport}
          onPress={() => sport && navigation.navigate('Recording', { sport })}
        />

        <View style={{ height: 8 }} />
        <Button title="History" onPress={() => navigation.navigate('History')} />
      </View>
    </View>
  );
}
