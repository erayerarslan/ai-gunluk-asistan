import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JournalProvider } from './src/context/JournalContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/paperTheme';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <JournalProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </JournalProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
