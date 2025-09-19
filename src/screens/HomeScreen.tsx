import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { StatusBadge } from '../components/StatusBadge';


type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const SPORTS = ['tennis', 'padel', 'pickleball'] as const;
type Sport = typeof SPORTS[number];

export default function HomeScreen({ navigation }: Props) {
  const [sport, setSport] = useState<Sport | null>(null);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'600' }}>RacketSense</Text>
      <StatusBadge />
      <Text>Select a sport:</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        {SPORTS.map(s => (
          <Button key={s} title={s.toUpperCase()} onPress={() => setSport(s)} />
        ))}
      </View>
      <Text>{sport ? `Selected: ${sport}` : 'None selected'}</Text>

      <View style={{ height:8 }} />
      <Button
        title="Start Session"
        disabled={!sport}
        onPress={() => sport && navigation.navigate('Recording', { sport })}
      />

      <View style={{ height:8 }} />
      <Button title="History" onPress={() => navigation.navigate('History')} />
    </View>
  );
}
