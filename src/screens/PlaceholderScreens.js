import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

const AddRecurringTransactionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="refresh" 
          size={64} 
          color={colors.warning} 
        />
        <Text style={styles.title}>Add Recurring Transaction</Text>
        <Text style={styles.subtitle}>
          This screen will allow you to set up recurring income or expenses.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const RecurrenceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="calendar-sync" 
          size={64} 
          color={colors.primary} 
        />
        <Text style={styles.title}>Recurring Transactions</Text>
        <Text style={styles.subtitle}>
          This screen will show all your recurring transactions and allow you to manage them.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const MedicationsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="pill" 
          size={64} 
          color={colors.secondary} 
        />
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.subtitle}>
          This screen will show your medications and reminders.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const AddMedicationScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="pill-plus" 
          size={64} 
          color={colors.success} 
        />
        <Text style={styles.title}>Add Medication</Text>
        <Text style={styles.subtitle}>
          This screen will allow you to add new medications with reminders.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const DailySpendingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="chart-line" 
          size={64} 
          color={colors.info} 
        />
        <Text style={styles.title}>Spending Charts</Text>
        <Text style={styles.subtitle}>
          This screen will show charts and analytics of your spending patterns.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const CurrencySettingsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="currency-usd" 
          size={64} 
          color={colors.primary} 
        />
        <Text style={styles.title}>Currency Settings</Text>
        <Text style={styles.subtitle}>
          This screen will allow you to manage currency preferences and exchange rates.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.headlineSmall,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    paddingHorizontal: spacing.lg,
  },
});

export {
  AddRecurringTransactionScreen,
  RecurrenceScreen,
  MedicationsScreen,
  AddMedicationScreen,
  DailySpendingScreen,
  CurrencySettingsScreen,
};

export default AddRecurringTransactionScreen;
