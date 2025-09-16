import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

// Screens
import LoadingScreen from '../components/ui/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TripListScreen from '../screens/TripListScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddRecurringTransactionScreen from '../screens/AddRecurringTransactionScreen';
import RecurrenceScreen from '../screens/RecurrenceScreen';
import MedicationListScreen from '../screens/MedicationListScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import DailySpendingScreen from '../screens/DailySpendingScreen';
import CurrencySettingsScreen from '../screens/CurrencySettingsScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
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

  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth screens if user is not logged in
  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={screenOptions}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: '🔐 Login',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: '📝 Cadastro'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

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
            headerRight: () => (
              <IconButton
                icon="logout"
                iconColor={theme.colors.onPrimary}
                onPress={async () => {
                  const result = await authService.logout();
                  if (result.success) {
                    // AuthContext vai detectar e navegar para login
                  }
                }}
              />
            ),
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
          name="AddRecurringTransaction" 
          component={AddRecurringTransactionScreen}
          options={{
            title: 'Nova Transação Recorrente',
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
        
        <Stack.Screen 
          name="CurrencySettings" 
          component={CurrencySettingsScreen}
          options={{
            title: 'Configurações de Moeda',
          }}
        />
        

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
