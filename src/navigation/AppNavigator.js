import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TripListScreen from '../screens/TripListScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import RecurrenceScreen from '../screens/RecurrenceScreen';
import MedicationListScreen from '../screens/MedicationListScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import DailySpendingScreen from '../screens/DailySpendingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const theme = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: theme.colors.onPrimary,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'NomadGuide',
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
          }}
        />
        
        <Stack.Screen 
          name="TripList" 
          component={TripListScreen}
          options={{
            title: 'Minhas Viagens',
          }}
        />
        
        <Stack.Screen 
          name="TripDetail" 
          component={TripDetailScreen}
          options={({ route }) => ({
            title: route.params?.tripName || 'Detalhes da Viagem',
          })}
        />
        
        <Stack.Screen 
          name="AddTransaction" 
          component={AddTransactionScreen}
          options={{
            title: 'Nova Transação',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen 
          name="Recurrence" 
          component={RecurrenceScreen}
          options={{
            title: 'Gastos Recorrentes',
          }}
        />
        
        <Stack.Screen 
          name="MedicationList" 
          component={MedicationListScreen}
          options={{
            title: 'Meus Medicamentos',
          }}
        />
        
        <Stack.Screen 
          name="AddMedication" 
          component={AddMedicationScreen}
          options={{
            title: 'Novo Medicamento',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen 
          name="DailySpending" 
          component={DailySpendingScreen}
          options={{
            title: 'Gastos Diários',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
