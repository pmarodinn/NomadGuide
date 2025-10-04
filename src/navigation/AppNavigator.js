import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TripListScreen from '../screens/TripListScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import {
  AddRecurringTransactionScreen,
  RecurrenceScreen,
  MedicationsScreen,
  AddMedicationScreen,
  DailySpendingScreen,
  CurrencySettingsScreen,
} from '../screens/PlaceholderScreens';

const Stack = createStackNavigator();

// Auth Stack (for non-authenticated users)
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          title: 'Welcome to NomadGuide',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account',
          headerBackTitleVisible: false
        }}
      />
    </Stack.Navigator>
  );
};

// Main Stack (for authenticated users)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'NomadGuide',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="TripList" 
        component={TripListScreen}
        options={{ 
          title: 'My Trips'
        }}
      />
      <Stack.Screen 
        name="TripDetail" 
        component={TripDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.tripName || 'Trip Details'
        })}
      />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{ 
          title: 'Add Transaction',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="AddRecurringTransaction" 
        component={AddRecurringTransactionScreen}
        options={{ 
          title: 'Add Recurring Transaction',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="Recurrence" 
        component={RecurrenceScreen}
        options={{ 
          title: 'Recurring Transactions'
        }}
      />
      <Stack.Screen 
        name="Medications" 
        component={MedicationsScreen}
        options={{ 
          title: 'Medications'
        }}
      />
      <Stack.Screen 
        name="AddMedication" 
        component={AddMedicationScreen}
        options={{ 
          title: 'Add Medication',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="DailySpending" 
        component={DailySpendingScreen}
        options={{ 
          title: 'Spending Charts'
        }}
      />
      <Stack.Screen 
        name="CurrencySettings" 
        component={CurrencySettingsScreen}
        options={{ 
          title: 'Currency Settings'
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
