// src/App.tsx
import React, { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { useUiStore } from './src/store/uiStore';

export default function App() {
  const rehydrate = useUiStore((s) => s.rehydrate);

  useEffect(() => {
    rehydrate(); // load saved selectedSport (no-op on web)
  }, [rehydrate]);

  return <RootNavigator />;
}
