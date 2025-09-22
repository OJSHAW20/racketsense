import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const sessions = useSessionStore(s => s.sessions);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {sessions.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>No sessions yet</Text>
        </View>
      ) : (
        <FlatList
          data={[...sessions].reverse()} // newest first
          keyExtractor={(it) => it.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
            onPress={() => navigation.navigate('SessionDetail', { id: item.id })}
              style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' }}
            >
              <Text style={{ fontWeight: '600' }}>
                {item.sport.toUpperCase()} • {new Date(item.dateMs).toLocaleString()}
              </Text>
              <Text>
                Swings {item.swings} · Max rally {item.maxRally} · Max speed {item.maxSpeed.toFixed(1)} m/s
              </Text>
              <Text>Duration {Math.round(item.durationMs / 1000)} s</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
