import React from 'react';
import { View, Text, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:'600' }}>RacketSense</Text>
      <Text>Select sport (using Tennis for now)</Text>
      <Button title="Start Session" onPress={() => navigation.navigate('Recording')} />
    </View>
  );
}
