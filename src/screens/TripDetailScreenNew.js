import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, SafeAreaView, StatusBar } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Text, 
  Button, 
  FAB, 
  Chip,
  List,
  IconButton,
  Surface,
  ProgressBar,
  Divider,
  Portal,
  Dialog,
  useTheme
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { colors, spacing, borderRadius, typography, elevation } from '../theme/colors';
import { 
  BalanceCard, 
  QuickActionButton, 
  SectionHeader, 
  TransactionItem, 
  CardContainer 
} from '../components/BankingComponents';

const TripDetailScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { 
    trips, 
    transactions, 
    categories,
    recurringTransactions,
    deleteTransaction, 
    getTripBalance,
    getTripTransactions,
    getTripByCategory,
    getProjectedBalance,
    confirmRecurringOccurrence,
  } = useTripContext();
  
  const { formatCurrency: formatCurrencyValue } = useCurrencyContext();
  
  const [trip, setTrip] = useState(null);
  const [tripTransactions, setTripTransactions] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [balance, setBalance] = useState(0);
  const [projected, setProjected] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, recurring: null });

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);

      if (currentTrip) {
        const transactionsForTrip = getTripTransactions(tripId);
        setTripTransactions(transactionsForTrip);
        
        const currentBalance = getTripBalance(tripId);
        setBalance(currentBalance);
        
        const projectedBalance = getProjectedBalance(tripId);
        setProjected(projectedBalance);

        // Category stats
        const categoryMap = new Map();
        transactionsForTrip.forEach(transaction => {
          if (transaction.type === 'expense') {
            const categoryName = transaction.categoryName || 'Gasto não informado';
            const current = categoryMap.get(categoryName) || 0;
            categoryMap.set(categoryName, current + transaction.amount);
          }
        });

        const stats = Array.from(categoryMap.entries())
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);
        
        setCategoryStats(stats);
      }
    }
  }, [tripId, trips, transactions, getTripBalance, getTripTransactions, getProjectedBalance]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleString('pt-BR');
  };

  const handleDeleteTransaction = async (transactionId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              Alert.alert('Sucesso', 'Transação excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          },
        },
      ]
    );
  };

  const handleConfirmRecurring = async (recurringTransaction) => {
    try {
      await confirmRecurringOccurrence(recurringTransaction);
      Alert.alert('Sucesso', 'Transação recorrente confirmada!');
      setConfirmDialog({ visible: false, recurring: null });
    } catch (error) {
      console.error('Error confirming recurring transaction:', error);
      Alert.alert('Erro', 'Não foi possível confirmar a transação');
    }
  };

  // Get pending recurring confirmations
  const pendingRecurring = recurringTransactions?.filter(r => {
    if (r.tripId !== tripId) return false;
    const today = new Date();
    const start = r.startDate?.toDate?.() || new Date(r.startDate);
    const end = r.endDate?.toDate?.() || new Date(r.endDate);
    
    return today >= start && today <= end;
  }) || [];

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSpent = tripTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalIncome = tripTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const progressValue = trip.budget > 0 ? Math.min(totalSpent / trip.budget, 1) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <Surface style={styles.headerSurface}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.backgroundSecondary}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{trip.name}</Text>
            <Text style={styles.headerSubtitle}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
          <IconButton
            icon="pencil"
            iconColor={colors.backgroundSecondary}
            onPress={() => {/* TODO: Edit trip */}}
          />
        </View>
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Overview */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <BalanceCard
              title="Orçamento"
              balance={formatCurrencyValue(trip.budget, trip.defaultCurrency)}
              type="primary"
              style={styles.balanceCard}
            />
            <BalanceCard
              title="Gasto"
              balance={formatCurrencyValue(totalSpent, trip.defaultCurrency)}
              type="error"
              style={styles.balanceCard}
            />
          </View>
          
          <View style={styles.balanceRow}>
            <BalanceCard
              title="Saldo Efetivo"
              balance={formatCurrencyValue(balance, trip.defaultCurrency)}
              type={balance >= 0 ? "success" : "error"}
              style={styles.balanceCard}
            />
            <BalanceCard
              title="Saldo Projetado"
              balance={formatCurrencyValue(projected, trip.defaultCurrency)}
              type="secondary"
              style={styles.balanceCard}
            />
          </View>

          {/* Progress Bar */}
          <CardContainer style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progresso do Orçamento</Text>
            <ProgressBar 
              progress={progressValue}
              color={progressValue > 0.8 ? colors.error : colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {(progressValue * 100).toFixed(1)}% do orçamento utilizado
            </Text>
          </CardContainer>
        </View>

        {/* Quick Actions */}
        <CardContainer style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="➕"
              title="Transação"
              onPress={() => navigation.navigate('AddTransaction', { tripId })}
              color={colors.primary}
            />
            <QuickActionButton
              icon="🔄"
              title="Recorrente"
              onPress={() => navigation.navigate('AddRecurringTransaction', { tripId })}
              color={colors.secondary}
            />
            <QuickActionButton
              icon="📊"
              title="Relatórios"
              onPress={() => {/* TODO: Reports */}}
              color={colors.warning}
            />
          </View>
        </CardContainer>

        {/* Pending Recurring Confirmations */}
        {pendingRecurring.length > 0 && (
          <>
            <SectionHeader title="Confirmações Pendentes" />
            <CardContainer style={styles.pendingCard}>
              <Text style={styles.pendingTitle}>
                {pendingRecurring.length} transação(ões) recorrente(s) pendente(s)
              </Text>
              {pendingRecurring.map((recurring, index) => (
                <View key={recurring.id} style={styles.pendingItem}>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingName}>
                      {recurring.description || `${recurring.frequency} recorrente`}
                    </Text>
                    <Text style={styles.pendingAmount}>
                      {formatCurrencyValue(recurring.amount, recurring.currency)}
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => setConfirmDialog({ visible: true, recurring })}
                    style={styles.confirmButton}
                  >
                    Confirmar
                  </Button>
                </View>
              ))}
            </CardContainer>
          </>
        )}

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <>
            <SectionHeader title="Gastos por Categoria" />
            <CardContainer>
              {categoryStats.map((stat, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{stat.name}</Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrencyValue(stat.amount, trip.defaultCurrency)}
                  </Text>
                </View>
              ))}
            </CardContainer>
          </>
        )}

        {/* Recent Transactions */}
        <SectionHeader 
          title="Transações Recentes" 
          action="Ver Todas"
          onActionPress={() => {/* TODO: All transactions */}}
        />
        
        {tripTransactions.length === 0 ? (
          <CardContainer style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>Nenhuma Transação</Text>
              <Text style={styles.emptyText}>
                Adicione uma transação para começar a acompanhar seus gastos.
              </Text>
            </View>
          </CardContainer>
        ) : (
          tripTransactions
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 10)
            .map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.description || 'Sem descrição'}
                category={transaction.categoryName || (transaction.type === 'expense' ? 'Gasto não informado' : 'Receita não informada')}
                amount={formatCurrencyValue(transaction.amount, transaction.currency)}
                date={formatDateTime(transaction.date || transaction.createdAt)}
                type={transaction.type}
                currency={transaction.currency}
                onPress={() => handleDeleteTransaction(transaction.id)}
              />
            ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={confirmDialog.visible} 
          onDismiss={() => setConfirmDialog({ visible: false, recurring: null })}
        >
          <Dialog.Title>Confirmar Transação Recorrente</Dialog.Title>
          <Dialog.Content>
            <Text>
              Confirmar transação "{confirmDialog.recurring?.description || 'recorrente'}" 
              no valor de {confirmDialog.recurring ? formatCurrencyValue(confirmDialog.recurring.amount, confirmDialog.recurring.currency) : ''}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, recurring: null })}>
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={() => handleConfirmRecurring(confirmDialog.recurring)}
            >
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  headerSurface: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...elevation.level2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headlineLarge,
    color: colors.backgroundSecondary,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.backgroundSecondary,
    opacity: 0.9,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Balance Section
  balanceSection: {
    paddingTop: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  balanceCard: {
    flex: 1,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsCard: {
    marginBottom: spacing.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  // Pending Confirmations
  pendingCard: {
    backgroundColor: colors.warningContainer,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: spacing.lg,
  },
  pendingTitle: {
    ...typography.headlineSmall,
    color: colors.warning,
    marginBottom: spacing.md,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingName: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  pendingAmount: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.warning,
  },

  // Category Stats
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  categoryName: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    flex: 1,
  },
  categoryAmount: {
    ...typography.bodyLarge,
    color: colors.error,
    fontWeight: '600',
  },

  // Common
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  
  emptyCard: {
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default TripDetailScreen;
