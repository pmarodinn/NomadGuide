import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import { MedicationProvider } from './src/contexts/MedicationContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import AppNavigator from './src/navigation/AppNavigator';

// Tema personalizado (azul e amarelo)
const theme = {
  colors: {
    primary: '#1565C0',            // Azul
    primaryContainer: '#E3F2FD',   // Azul claro
    secondary: '#FFC107',          // Amarelo
    secondaryContainer: '#FFF8E1', // Amarelo claro
    tertiary: '#0D47A1',
    tertiaryContainer: '#E3F2FD',
    surface: '#ffffff',
    surfaceVariant: '#F7F9FC',
    background: '#F7F9FC',
    error: '#D32F2F',
    errorContainer: '#FFEBEE',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#0D47A1',
    onSecondary: '#000000',
    onSecondaryContainer: '#795548',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#0D47A1',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    onBackground: '#0F172A',
    onError: '#ffffff',
    onErrorContainer: '#D32F2F',
    outline: '#E2E8F0',
    outlineVariant: '#E2E8F0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1E293B',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#90CAF9',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#FAFBFF',
      level3: '#F4F7FE',
      level4: '#EEF2FF',
      level5: '#E3F2FD',
    },
  },
  roundness: 12,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <CurrencyProvider>
          <TripProvider>
            <MedicationProvider>
              <StatusBar style="light" backgroundColor="#1565C0" />
              <AppNavigator />
            </MedicationProvider>
          </TripProvider>
        </CurrencyProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
