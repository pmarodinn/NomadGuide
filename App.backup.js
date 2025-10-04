import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import theme and contexts
import theme from './src/theme/theme';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <CurrencyProvider>
              <TripProvider>
                <AppNavigator />
                <StatusBar style="auto" />
              </TripProvider>
            </CurrencyProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
