import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSessionStore } from '../store/sessionStore';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const sessions = useSessionStore(s => s.sessions);

  const data = React.useMemo(
    () => [...sessions].sort((a, b) => b.dateMs - a.dateMs), // explicit newest-first
    [sessions]
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {data.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>No sessions yet</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const metaBits: string[] = [];
            if (item.strapTag) metaBits.push(`Strap ${item.strapTag}`);
            if (item.racket) metaBits.push(item.racket);
            if (item.gripSize) metaBits.push(`Grip ${item.gripSize}`);
            if (typeof item.overgrip === 'boolean')
              metaBits.push(item.overgrip ? 'Overgrip: yes' : 'Overgrip: no');

            return (
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
                {metaBits.length > 0 && (
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>
                    {metaBits.join(' · ')}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
