import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/colors';

const TripDetailScreen = ({ navigation, route }) => {
  const { tripName } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="map-marker-outline" 
          size={64} 
          color={colors.primary} 
        />
        <Text style={styles.title}>Trip Details</Text>
        {tripName && <Text style={styles.tripName}>{tripName}</Text>}
        <Text style={styles.subtitle}>
          This screen will show detailed trip information, transactions, and analytics.
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
  tripName: {
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

export default TripDetailScreen;
