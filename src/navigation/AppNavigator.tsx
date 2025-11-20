import React, { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';

import { HistoryScreen } from '../screens/HistoryScreen';
import { DailyEntryScreen } from '../screens/DailyEntryScreen';

const routes = [
  { key: 'daily', title: 'Günlük', focusedIcon: 'pencil' },
  { key: 'history', title: 'Geçmiş', focusedIcon: 'history' },
];

const renderScene = BottomNavigation.SceneMap({
  daily: DailyEntryScreen,
  history: HistoryScreen,
});

export function AppNavigator() {
  const [index, setIndex] = useState(0);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      sceneAnimationType="opacity"
    />
  );
}

