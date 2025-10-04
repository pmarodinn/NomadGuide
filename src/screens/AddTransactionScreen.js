import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

const AddTransactionScreen = ({ navigation, route }) => {
  const { type } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={type === 'income' ? 'cash-plus' : 'cash-minus'} 
          size={64} 
          color={type === 'income' ? colors.success : colors.error} 
        />
        <Text style={styles.title}>Add Transaction</Text>
        <Text style={styles.type}>
          {type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'Transaction'}
        </Text>
        <Text style={styles.subtitle}>
          This screen will allow you to add new income or expense transactions.
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
    marginBottom: spacing.sm,
  },
  type: {
    ...typography.titleMedium,
    color: colors.primary,
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

export default AddTransactionScreen;
