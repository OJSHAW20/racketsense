import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import SummaryScreen from '../screens/SummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Recording: { sport: string };
  Summary: {
    sport: string;
    durationMs: number;
    swings: number;
    maxRally: number;
    avgSpeed: number;
    maxSpeed: number;
    startedAtMs: number;
  };
  History: undefined;
  SessionDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RacketSense' }} />
        <Stack.Screen name="Recording" component={RecordingScreen} options={{ title: 'Recording' }} />
        <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Session Summary' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
