import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import { MedicationProvider } from './src/contexts/MedicationContext';
import AppNavigator from './src/navigation/AppNavigator';

// Tema personalizado do Material Design
const theme = {
  colors: {
    primary: '#6200ea',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    secondaryContainer: '#03dac6',
    surface: '#ffffff',
    background: '#f5f5f5',
    error: '#b00020',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
    onError: '#ffffff',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <TripProvider>
          <MedicationProvider>
            <StatusBar style="light" backgroundColor="#6200ea" />
            <AppNavigator />
          </MedicationProvider>
        </TripProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
