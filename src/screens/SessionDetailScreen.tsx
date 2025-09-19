import React from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen({ route }: Props) {
  const { id } = route.params;
  const session = useSessionStore(s => s.sessions.find(x => x.id === id));

  if (!session) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>Session not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16, gap:8 }}>
      <Text style={{ fontSize:20, fontWeight:'600' }}>
        {session.sport.toUpperCase()} • {new Date(session.dateMs).toLocaleString()}
      </Text>
      <Text>Duration: {Math.round(session.durationMs/1000)} s</Text>
      <Text>Swings: {session.swings}</Text>
      <Text>Max rally: {session.maxRally}</Text>
      <Text>Avg speed: {session.avgSpeed.toFixed(2)} m/s</Text>
      <Text>Max speed: {session.maxSpeed.toFixed(2)} m/s</Text>

      {/* Placeholder for timeline / histogram in later steps */}
      <View style={{ height: 16 }} />
      <Text style={{ opacity: 0.6 }}>Timeline & histogram coming later</Text>
    </View>
  );
}
