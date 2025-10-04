import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { IconButton, FAB, Snackbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  BalanceCard, 
  QuickActionButton, 
  SectionHeader, 
  CardContainer,
  QuickActionsGrid,
  StatsCard
} from '../components/BankingComponents';
import { colors, spacing, typography, elevation, borderRadius } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { 
    trips, 
    getActiveTrip, 
    getTripBalance, 
    getProjectedBalance, 
    loading: tripLoading 
  } = useTrip();
  const { formatCurrency, loading: currencyLoading } = useCurrency();

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const activeTrip = getActiveTrip();
  const currentBalance = activeTrip ? getTripBalance() : 0;
  const projectedBalance = activeTrip ? getProjectedBalance() : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setSnackbarMessage('Error signing out');
      setSnackbarVisible(true);
    }
  };

  const quickActions = [
    {
      title: 'Add Expense',
      icon: 'cash-minus',
      onPress: () => navigation.navigate('AddTransaction', { type: 'expense' }),
      type: 'error',
    },
    {
      title: 'Add Income',
      icon: 'cash-plus',
      onPress: () => navigation.navigate('AddTransaction', { type: 'income' }),
      type: 'success',
    },
    {
      title: 'Recurring',
      icon: 'refresh',
      onPress: () => navigation.navigate('AddRecurringTransaction'),
      type: 'warning',
    },
    {
      title: 'Medications',
      icon: 'pill',
      onPress: () => navigation.navigate('Medications'),
      type: 'secondary',
    },
  ];

  const formatBalance = (amount) => {
    if (!activeTrip) return '$0.00';
    return formatCurrency(amount, activeTrip.defaultCurrency || 'USD');
  };

  const getBalanceColor = (balance) => {
    if (balance < 0) return colors.error;
    if (balance < (activeTrip?.initialBudget || 0) * 0.2) return colors.warning;
    return colors.success;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="airplane-takeoff" 
            size={28} 
            color={colors.primary} 
          />
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName}>{user?.displayName || 'Traveler'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="cog"
            size={24}
            iconColor={colors.onSurfaceVariant}
            onPress={() => navigation.navigate('CurrencySettings')}
          />
          <IconButton
            icon="logout"
            size={24}
            iconColor={colors.onSurfaceVariant}
            onPress={handleLogout}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Trip Section */}
        {activeTrip ? (
          <>
            {/* Trip Header */}
            <View style={styles.tripHeader}>
              <View style={styles.tripInfo}>
                <Text style={styles.tripName}>{activeTrip.name}</Text>
                <Text style={styles.tripDates}>
                  {activeTrip.startDate ? 
                    new Date(activeTrip.startDate.toDate()).toLocaleDateString() : 'No date'
                  } - {activeTrip.endDate ? 
                    new Date(activeTrip.endDate.toDate()).toLocaleDateString() : 'No date'
                  }
                </Text>
              </View>
              <Chip 
                mode="flat" 
                style={[styles.activeChip, { backgroundColor: colors.successContainer }]}
                textStyle={{ color: colors.success }}
              >
                Active
              </Chip>
            </View>

            {/* Balance Cards */}
            <View style={styles.balanceSection}>
              <View style={styles.balanceRow}>
                <BalanceCard
                  title="Current Balance"
                  balance={formatBalance(currentBalance)}
                  subtitle="available now"
                  type={currentBalance >= 0 ? 'success' : 'error'}
                  style={[styles.balanceCard, styles.balanceCardLeft]}
                />
                <BalanceCard
                  title="Projected"
                  balance={formatBalance(projectedBalance)}
                  subtitle="including recurring"
                  type={projectedBalance >= 0 ? 'primary' : 'warning'}
                  style={[styles.balanceCard, styles.balanceCardRight]}
                />
              </View>
              
              <StatsCard
                title="Initial Budget"
                value={formatBalance(activeTrip.initialBudget || 0)}
                subtitle={`${activeTrip.defaultCurrency || 'USD'} • Trip Budget`}
                icon="wallet"
                iconColor={colors.primary}
                style={styles.budgetCard}
              />
            </View>

            {/* Quick Actions */}
            <SectionHeader 
              title="Quick Actions" 
              icon="lightning-bolt"
              style={styles.sectionHeader}
            />
            <QuickActionsGrid actions={quickActions} style={styles.quickActions} />

            {/* Recent Activity */}
            <SectionHeader 
              title="Recent Activity" 
              action="View All"
              onActionPress={() => navigation.navigate('TripDetail', { 
                tripId: activeTrip.id, 
                tripName: activeTrip.name 
              })}
              icon="history"
              style={styles.sectionHeader}
            />
            <CardContainer style={styles.activityCard}>
              <View style={styles.activityPlaceholder}>
                <MaterialCommunityIcons 
                  name="chart-line" 
                  size={48} 
                  color={colors.onSurfaceVariant} 
                />
                <Text style={styles.placeholderText}>
                  Your recent transactions will appear here
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Start by adding your first expense or income
                </Text>
              </View>
            </CardContainer>

            {/* Spending Overview */}
            <SectionHeader 
              title="Spending Overview" 
              action="View Charts"
              onActionPress={() => navigation.navigate('DailySpending')}
              icon="chart-pie"
              style={styles.sectionHeader}
            />
            <CardContainer style={styles.overviewCard}>
              <View style={styles.overviewPlaceholder}>
                <MaterialCommunityIcons 
                  name="chart-donut" 
                  size={48} 
                  color={colors.onSurfaceVariant} 
                />
                <Text style={styles.placeholderText}>
                  Spending breakdown coming soon
                </Text>
              </View>
            </CardContainer>
          </>
        ) : (
          /* No Active Trip */
          <View style={styles.noTripContainer}>
            <CardContainer style={styles.noTripCard}>
              <View style={styles.noTripContent}>
                <MaterialCommunityIcons 
                  name="airplane-plus" 
                  size={64} 
                  color={colors.primary} 
                />
                <Text style={styles.noTripTitle}>No Active Trip</Text>
                <Text style={styles.noTripSubtitle}>
                  Create your first trip to start tracking expenses
                </Text>
                
                <QuickActionButton
                  title="Create Trip"
                  icon="plus"
                  onPress={() => navigation.navigate('TripList')}
                  type="primary"
                  style={styles.createTripButton}
                />
              </View>
            </CardContainer>

            {/* All Trips */}
            {trips.length > 0 && (
              <>
                <SectionHeader 
                  title="All Trips" 
                  action="Manage"
                  onActionPress={() => navigation.navigate('TripList')}
                  icon="briefcase"
                  style={styles.sectionHeader}
                />
                <Text style={styles.tripsCount}>
                  You have {trips.length} trip{trips.length !== 1 ? 's' : ''} created
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {activeTrip && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddTransaction')}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...elevation.level1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.md,
  },
  welcomeText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  userName: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    ...typography.titleLarge,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tripDates: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  activeChip: {
    borderRadius: borderRadius.full,
  },
  balanceSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  balanceCard: {
    flex: 1,
  },
  balanceCardLeft: {
    marginRight: spacing.sm,
  },
  balanceCardRight: {
    marginLeft: spacing.sm,
  },
  budgetCard: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  overviewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  overviewPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  placeholderText: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderSubtext: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  noTripContainer: {
    padding: spacing.lg,
  },
  noTripCard: {
    marginBottom: spacing.lg,
  },
  noTripContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noTripTitle: {
    ...typography.titleLarge,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noTripSubtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createTripButton: {
    minWidth: 200,
  },
  tripsCount: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default HomeScreen;
