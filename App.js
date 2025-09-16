import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import { MedicationProvider } from './src/contexts/MedicationContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import AppNavigator from './src/navigation/AppNavigator';

// Tema personalizado do Material Design
const theme = {
  colors: {
    primary: '#6200ea',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    secondaryContainer: '#03dac6',
    tertiary: '#ff5722',
    tertiaryContainer: '#ffccbc',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#f5f5f5',
    error: '#b00020',
    errorContainer: '#ffcdd2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#000000',
    onSecondary: '#000000',
    onSecondaryContainer: '#000000',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#666666',
    onBackground: '#000000',
    onError: '#ffffff',
    onErrorContainer: '#000000',
    outline: '#cccccc',
    outlineVariant: '#e0e0e0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#333333',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#bb86fc',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#f8f8ff',
      level3: '#f0f0ff',
      level4: '#eeeeee',
      level5: '#e8e8e8',
    },
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <CurrencyProvider>
          <TripProvider>
            <MedicationProvider>
              <StatusBar style="light" backgroundColor="#6200ea" />
              <AppNavigator />
            </MedicationProvider>
          </TripProvider>
        </CurrencyProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
