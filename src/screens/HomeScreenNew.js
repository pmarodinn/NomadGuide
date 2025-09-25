import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { 
  Text, 
  Button, 
  TextInput,
  Snackbar,
  Surface
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTripContext } from '../contexts/TripContext';
import { useMedicationContext } from '../contexts/MedicationContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { colors, spacing, borderRadius, typography, elevation } from '../theme/colors';
import { 
  BalanceCard, 
  QuickActionButton, 
  SectionHeader, 
  CardContainer 
} from '../components/BankingComponents';
import LoadingScreen from '../components/ui/LoadingScreen';

const HomeScreen = ({ navigation }) => {
  const { user, loading: authLoading } = useAuth();
  const { 
    getActiveTrip,
    getTripBalance,
    getProjectedBalance,
    addTransaction,
    loading: tripLoading 
  } = useTripContext();
  
  const { 
    medicationsDueSoon, 
    activeMedications, 
    loading: medicationLoading 
  } = useMedicationContext();
  
  const { formatCurrency: formatCurrencyValue } = useCurrencyContext();

  // Quick add state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showSnack = (message) => setSnackbar({ visible: true, message });

  // Get active trip data
  const activeTrip = getActiveTrip();
  const currentBalance = activeTrip ? getTripBalance(activeTrip.id) : 0;
  const projectedBalance = activeTrip ? getProjectedBalance(activeTrip.id) : 0;

  const getDaysRemaining = (end) => {
    if (!end) return 0;
    const endDate = end?.toDate ? end.toDate() : new Date(end);
    const today = new Date();
    endDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = endDate.getTime() - today.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, days);
  };

  const daysRemaining = activeTrip ? getDaysRemaining(activeTrip.endDate) : 0;
  const dailyBudget = daysRemaining > 0 ? Math.max(0, currentBalance / daysRemaining) : 0;

  if (authLoading || !user) {
    return <LoadingScreen message="Conectando..." />;
  }

  const handleQuickExpense = async () => {
    if (!activeTrip) {
      Alert.alert('Nenhuma Viagem Ativa', 'Crie uma viagem primeiro.');
      return;
    }
    
    const value = parseFloat(String(quickAmount).replace(',', '.'));
    if (!value || isNaN(value) || value <= 0) {
      return showSnack('Informe um valor válido');
    }
    
    try {
      setQuickLoading(true);
      await addTransaction({
        tripId: activeTrip.id,
        amount: value,
        type: 'expense',
        description: 'Gasto rápido',
        categoryId: null,
        currency: activeTrip?.defaultCurrency || 'USD',
        date: new Date(),
      });
      setQuickAmount('');
      showSnack('Gasto adicionado com sucesso');
    } catch (error) {
      showSnack('Erro ao adicionar gasto');
    } finally {
      setQuickLoading(false);
    }
  };

  const navigateToAddTransaction = () => {
    if (!activeTrip) {
      Alert.alert('Nenhuma Viagem Ativa', 'Crie uma viagem primeiro.');
      return;
    }
    navigation.navigate('AddTransaction', { tripId: activeTrip.id });
  };

  const navigateToRecurring = () => {
    if (!activeTrip) {
      Alert.alert('Nenhuma Viagem Ativa', 'Crie uma viagem primeiro.');
      return;
    }
    navigation.navigate('AddRecurringTransaction', { tripId: activeTrip.id });
  };

  const navigateToExtract = () => {
    if (!activeTrip) {
      Alert.alert('Nenhuma Viagem Ativa', 'Crie uma viagem primeiro.');
      return;
    }
    navigation.navigate('TripDetail', { tripId: activeTrip.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Banking Header */}
      <Surface style={styles.headerSurface}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bem-vindo</Text>
          <Text style={styles.userName}>{user?.displayName || 'Viajante'}</Text>
          
          {activeTrip ? (
            <>
              <Text style={styles.tripName}>{activeTrip.name}</Text>
              <View style={styles.mainBalanceRow}>
                <BalanceCard
                  title="Saldo Atual"
                  balance={formatCurrencyValue(currentBalance, activeTrip.defaultCurrency || 'USD')}
                  type={currentBalance >= 0 ? "success" : "error"}
                  style={styles.mainBalanceCard}
                />
                <BalanceCard
                  title="Projetado"
                  balance={formatCurrencyValue(projectedBalance, activeTrip.defaultCurrency || 'USD')}
                  type="secondary"
                  style={styles.mainBalanceCard}
                />
              </View>
              
              {daysRemaining > 0 && (
                <View style={styles.dailyBudgetContainer}>
                  <Text style={styles.dailyBudgetLabel}>Disponível por dia</Text>
                  <Text style={styles.dailyBudgetValue}>
                    {formatCurrencyValue(dailyBudget, activeTrip.defaultCurrency || 'USD')}
                  </Text>
                  <Text style={styles.daysRemainingText}>{daysRemaining} dias restantes</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noTripContainer}>
              <Text style={styles.noTripText}>Nenhuma viagem ativa</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('TripList')}
                style={styles.createTripButton}
                buttonColor={colors.backgroundSecondary}
                textColor={colors.primary}
              >
                Criar Viagem
              </Button>
            </View>
          )}
        </View>
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Quick Expense */}
        {activeTrip && (
          <CardContainer style={styles.quickExpenseCard}>
            <SectionHeader title="Gasto Rápido" />
            <View style={styles.quickExpenseRow}>
              <TextInput
                mode="outlined"
                label={`Valor (${activeTrip.defaultCurrency || 'USD'})`}
                value={quickAmount}
                onChangeText={setQuickAmount}
                keyboardType="decimal-pad"
                style={styles.quickInput}
                outlineColor={colors.outline}
                activeOutlineColor={colors.primary}
              />
              <Button
                mode="contained"
                onPress={handleQuickExpense}
                loading={quickLoading}
                disabled={quickLoading || !quickAmount}
                style={styles.quickButton}
                buttonColor={colors.error}
              >
                Gastar
              </Button>
            </View>
          </CardContainer>
        )}

        {/* Quick Actions */}
        <CardContainer style={styles.actionsCard}>
          <SectionHeader title="Ações" />
          <View style={styles.actionsGrid}>
            <QuickActionButton
              icon="+"
              title="Transação"
              onPress={navigateToAddTransaction}
              color={colors.primary}
              disabled={!activeTrip}
            />
            <QuickActionButton
              icon="↻"
              title="Recorrente"
              onPress={navigateToRecurring}
              color={colors.secondary}
              disabled={!activeTrip}
            />
            <QuickActionButton
              icon="○"
              title="Medicamentos"
              onPress={() => navigation.navigate('Medications')}
              color={colors.warning}
            />
            <QuickActionButton
              icon="≡"
              title="Ver Extrato"
              onPress={navigateToExtract}
              color={colors.success}
              disabled={!activeTrip}
            />
          </View>
        </CardContainer>

        {/* Medication Alerts */}
        {medicationsDueSoon.length > 0 && (
          <CardContainer style={styles.medicationCard}>
            <SectionHeader title="Medicamentos Próximos" />
            <Text style={styles.medicationCount}>
              {medicationsDueSoon.length} medicamento(s) nas próximas 2 horas
            </Text>
            <View style={styles.medicationActions}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Medications')}
                style={styles.medicationButton}
                buttonColor={colors.warning}
              >
                Gerenciar
              </Button>
            </View>
          </CardContainer>
        )}

        {/* Active Medications Status */}
        {activeMedications.length > 0 && medicationsDueSoon.length === 0 && (
          <CardContainer style={styles.statusCard}>
            <SectionHeader title="Medicamentos" />
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusCount}>{activeMedications.length}</Text>
                <Text style={styles.statusLabel}>Ativos</Text>
              </View>
              <Text style={styles.statusOk}>Tudo em dia</Text>
            </View>
          </CardContainer>
        )}

        {/* Navigation Actions */}
        <CardContainer style={styles.navigationCard}>
          <SectionHeader title="Navegar" />
          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('TripList')}
              style={styles.navButton}
              contentStyle={styles.navButtonContent}
            >
              Minhas Viagens
            </Button>
            <Button
              mode="outlined"
              onPress={() => activeTrip ? navigation.navigate('DailySpending', { tripId: activeTrip.id }) : navigation.navigate('TripList')}
              style={styles.navButton}
              contentStyle={styles.navButtonContent}
            >
              Gráficos
            </Button>
          </View>
        </CardContainer>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header Banking Style
  headerSurface: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...elevation.level3,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.labelLarge,
    color: colors.backgroundSecondary,
    opacity: 0.9,
  },
  userName: {
    ...typography.headlineLarge,
    color: colors.backgroundSecondary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  tripName: {
    ...typography.titleLarge,
    color: colors.backgroundSecondary,
    opacity: 0.95,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  mainBalanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  mainBalanceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dailyBudgetContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  dailyBudgetLabel: {
    ...typography.bodyMedium,
    color: colors.backgroundSecondary,
    opacity: 0.8,
  },
  dailyBudgetValue: {
    ...typography.headlineMedium,
    color: colors.backgroundSecondary,
    fontWeight: '600',
    marginVertical: spacing.xs,
  },
  daysRemainingText: {
    ...typography.bodySmall,
    color: colors.backgroundSecondary,
    opacity: 0.7,
  },
  noTripContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noTripText: {
    ...typography.titleLarge,
    color: colors.backgroundSecondary,
    marginBottom: spacing.md,
  },
  createTripButton: {
    borderRadius: borderRadius.lg,
  },
  
  // ScrollView Content
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Quick Expense Card
  quickExpenseCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  quickExpenseRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  quickInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  quickButton: {
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  
  // Actions Card
  actionsCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Medication Card
  medicationCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  medicationCount: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  medicationActions: {
    alignItems: 'flex-start',
  },
  medicationButton: {
    borderRadius: borderRadius.md,
  },
  
  // Status Card
  statusCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusCount: {
    ...typography.headlineMedium,
    color: colors.success,
    fontWeight: '600',
  },
  statusLabel: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  statusOk: {
    ...typography.titleMedium,
    color: colors.success,
    fontWeight: '500',
  },
  
  // Navigation Card
  navigationCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    borderColor: colors.outline,
  },
  navButtonContent: {
    paddingVertical: spacing.sm,
  },
  
  // Bottom Spacing
  bottomSpacer: {
    height: spacing.xxl,
  },
  
  // Snackbar
  snackbar: {
    backgroundColor: colors.surface,
  },
});

export default HomeScreen;
