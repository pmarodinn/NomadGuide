import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
  Dialog
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';

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
  const [fabOpen, setFabOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, recurring: null });

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
      
      if (currentTrip) {
        const tripTxns = getTripTransactions(tripId);
        setTripTransactions(tripTxns);
        setBalance(getTripBalance(tripId));
        setProjected(getProjectedBalance(tripId));
        
        // Calculate category statistics (expenses only)
        const stats = categories.map(category => {
          const categoryTransactions = getTripByCategory(tripId, category.id);
          const total = categoryTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
          return {
            ...category,
            total,
            count: categoryTransactions.length
          };
        }).filter(stat => stat.total !== 0);
        
        setCategoryStats(stats);
      }
    }
  }, [tripId, trips, transactions, categories, recurringTransactions]);

  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteTransaction(transactionId)
        }
      ]
    );
  };

  const formatCurrency = (value) => {
    const currency = trip?.defaultCurrency || 'USD';
    return formatCurrencyValue(value || 0, currency);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  const getBalanceColor = () => {
    if (balance > 0) return '#4CAF50';
    if (balance < 0) return '#F44336';
    return '#757575';
  };

  const getBudgetProgress = () => {
    if (!trip?.budget || trip.budget === 0) return 0;
    const spent = Math.abs(balance - (trip.budget || 0));
    return Math.min(spent / trip.budget, 1);
  };

  const dueRecurrences = (() => {
    const today = new Date();
    return (recurringTransactions || []).filter(r => r.tripId === tripId && (() => {
      const start = r.startDate?.toDate?.() || new Date(r.startDate);
      const end = r.endDate?.toDate?.() || new Date(r.endDate);
      if (!start || !end) return false;
      // next occurrence date calculation (simplified to: if today >= start and today <= end)
      return today >= start && today <= end;
    })());
  })();

  const handleConfirmRecurring = async () => {
    if (!confirmDialog.recurring) return;
    try {
      await confirmRecurringOccurrence(confirmDialog.recurring);
      setConfirmDialog({ visible: false, recurring: null });
    } catch (e) {
      console.error(e);
    }
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text>Viagem não encontrada</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Trip Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title>{trip.name}</Title>
            {trip.description && (
              <Paragraph style={styles.description}>{trip.description}</Paragraph>
            )}
            
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Text>
              {trip.isActive && (
                <Chip icon="check-circle" style={styles.activeChip}>
                  Ativa
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Budget Overview */}
        <Card style={styles.card}>
          <Card.Title title="Orçamento" />
          <Card.Content>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Orçamento:</Text>
              <Text style={styles.budgetValue}>{formatCurrency(trip?.budget)}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Saldo Efetivo:</Text>
              <Text style={[styles.balanceValue]}>{formatCurrency(balance)}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Saldo Projetado:</Text>
              <Text style={[styles.balanceValue]}>{formatCurrency(projected)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Category Statistics */}
        {categoryStats.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Gastos por Categoria" />
            <Card.Content>
              {categoryStats.map((stat, index) => (
                <View key={stat.id}>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{stat.name}</Text>
                    <View style={styles.categoryStats}>
                      <Text style={styles.categoryCount}>{stat.count} transações</Text>
                      <Text style={styles.categoryTotal}>{formatCurrency(stat.total)}</Text>
                    </View>
                  </View>
                  {index < categoryStats.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Transactions List */}
        <Card style={styles.card}>
          <Card.Title 
            title="Transações" 
            subtitle={`${tripTransactions.length} transações`}
          />
          <Card.Content>
            {tripTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                <Text style={styles.emptySubtext}>
                  Toque no botão + para adicionar sua primeira transação
                </Text>
              </View>
            ) : (
              tripTransactions
                .sort((a, b) => {
                  const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                  const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  const defaultLabel = transaction.type === 'income' ? 'Receita não informada' : 'Gasto não informado';
                  const categoryLabel = category?.name || transaction.categoryName || defaultLabel;
                  return (
                    <Surface key={transaction.id} style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionTitle}>
                            {transaction.description || 'Sem descrição'}
                          </Text>
                          <Text style={styles.transactionCategory}>
                            {categoryLabel}
                          </Text>
                          <Text style={styles.transactionDate}>
                            {formatDate(transaction.date)}
                          </Text>
                        </View>
                        
                        <View style={styles.transactionRight}>
                          <Text style={[
                            styles.transactionAmount,
                            { 
                              color: transaction.type === 'income' ? '#4CAF50' : '#F44336' 
                            }
                          ]}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrencyValue(
                              Math.abs(transaction.amount),
                              transaction.currency || trip?.defaultCurrency || 'USD'
                            )}
                          </Text>
                          
                          <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteTransaction(transaction.id)}
                          />
                        </View>
                      </View>
                    </Surface>
                  );
                })
            )}
          </Card.Content>
        </Card>

        {/* Recurring confirmations */}
        {dueRecurrences.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Confirmações Pendentes" subtitle="Transações recorrentes com ocorrência para hoje" />
            <Card.Content>
              {dueRecurrences.map(r => (
                <View key={r.id} style={styles.recurringRow}>
                  <Text style={styles.recurringText}>
                    {r.description || `${r.frequency} - ${r.type === 'expense' ? 'Gasto' : 'Receita'}`} — {formatCurrency(r.amount)}
                  </Text>
                  <Button mode="contained" onPress={() => setConfirmDialog({ visible: true, recurring: r })}>
                    Confirmar
                  </Button>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Portal>
          <Dialog visible={confirmDialog.visible} onDismiss={() => setConfirmDialog({ visible: false, recurring: null })}>
            <Dialog.Title>Confirmar recorrente</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Deseja aplicar esta ocorrência ao saldo efetivo?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmDialog({ visible: false, recurring: null })}>Cancelar</Button>
              <Button mode="contained" onPress={handleConfirmRecurring}>Confirmar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Transaction FAB */}
      <FAB.Group
        open={fabOpen}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'cash',
            label: 'Transação Simples',
            onPress: () => navigation.navigate('AddTransaction', { tripId }),
          },
          {
            icon: 'refresh',
            label: 'Transação Recorrente',
            onPress: () => navigation.navigate('AddRecurringTransaction', { tripId }),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        style={styles.fabGroup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  description: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  activeChip: {
    backgroundColor: '#E8F5E8',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
  },
  divider: {
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fabGroup: {
    paddingBottom: 16,
  },
  bottomSpacer: {
    height: 80,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  recurringText: {
    flex: 1,
    marginRight: 8,
  },
});

export default TripDetailScreen;
