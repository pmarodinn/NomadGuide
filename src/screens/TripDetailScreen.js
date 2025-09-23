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
  Dialog,
  useTheme
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
  const theme = useTheme();
  
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
  }, [tripId, trips, transactions, categories, recurringTransactions, getTripTransactions, getTripBalance, getProjectedBalance, getTripByCategory]);

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

  const getBalanceColor = (value) => {
    if (value > 0) return '#4CAF50';
    if (value < 0) return '#F44336';
    return theme.colors.onSurface;
  };

  const getBudgetProgress = () => {
    if (!trip?.budget || trip.budget === 0) return 0;
    const spent = Math.abs(balance - (trip.budget || 0));
    return Math.min(spent / trip.budget, 1);
  };

  const getDaysRemaining = () => {
    if (!trip?.endDate) return 0;
    const endDate = trip.endDate?.toDate?.() || new Date(trip.endDate);
    const today = new Date();
    endDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = endDate.getTime() - today.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusivo
    return Math.max(0, days);
  };

  const daysRemaining = getDaysRemaining();
  const realDaily = daysRemaining > 0 ? Math.max(0, balance / daysRemaining) : 0;
  const projectedDaily = daysRemaining > 0 ? Math.max(0, projected / daysRemaining) : 0;

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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Viagem não encontrada</Title>
            <Paragraph>A viagem que você está procurando não foi encontrada ou foi excluída.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Trip Header */}
        <Card style={[styles.card, styles.headerCard]}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title style={styles.headerTitle}>{trip.name}</Title>
              {trip.isActive && (
                <Chip icon="check-circle" style={styles.activeChip} textStyle={styles.activeChipText}>
                  Ativa
                </Chip>
              )}
            </View>
            {trip.description && (
              <Paragraph style={styles.description}>{trip.description}</Paragraph>
            )}
            <Text style={styles.dateText}>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </Text>
          </Card.Content>
        </Card>

        {/* Budget & Balance Overview */}
        <Card style={[styles.card, styles.elevated]}>
          <Card.Content>
            <View style={styles.balanceRow}>
              <View style={[styles.balanceItem, styles.pill]}>
                <Text style={styles.balanceLabel}>Saldo Real</Text>
                <Text style={[styles.balanceValue, { color: getBalanceColor(balance) }]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
              <View style={[styles.balanceItem, styles.pill]}>
                <Text style={styles.balanceLabel}>Saldo Projetado</Text>
                <Text style={[styles.balanceValue, { color: getBalanceColor(projected) }]}>
                  {formatCurrency(projected)}
                </Text>
              </View>
            </View>
            
            {daysRemaining > 0 && (
              <View style={styles.balanceRow}>
                <View style={[styles.balanceItem, styles.pillSoft]}>
                  <Text style={styles.balanceLabel}>Diário (Real)</Text>
                  <Text style={styles.balanceValue}>{formatCurrency(realDaily)}</Text>
                </View>
                <View style={[styles.balanceItem, styles.pillSoft]}>
                  <Text style={styles.balanceLabel}>Diário (Projetado)</Text>
                  <Text style={styles.balanceValue}>{formatCurrency(projectedDaily)}</Text>
                </View>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Orçamento Total:</Text>
              <Text style={styles.budgetValue}>{formatCurrency(trip?.budget)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Category Statistics */}
        {categoryStats.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Gastos por Categoria" />
            <Card.Content>
              {categoryStats.map((stat) => (
                <List.Item
                  key={stat.id}
                  title={`${stat.icon || '📁'} ${stat.name}`}
                  description={`${stat.count} transações`}
                  right={() => <Text style={styles.categoryTotal}>{formatCurrency(stat.total)}</Text>}
                  style={styles.categoryItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Transactions List */}
        <Card style={styles.card}>
          <Card.Title 
            title="Transações" 
            subtitle={`${tripTransactions.length} lançamentos`}
          />
          <Card.Content>
            {tripTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
                <Paragraph style={styles.emptySubtext}>
                  Toque no botão + para adicionar seu primeiro lançamento.
                </Paragraph>
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
                    <Surface key={transaction.id} style={styles.transactionCard} elevation={1}>
                      <View style={styles.transactionRow}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription}>
                            {transaction.description || 'Sem descrição'}
                          </Text>
                          <View style={styles.transactionDetails}>
                            <Chip icon="tag" style={styles.detailChip}>{categoryLabel}</Chip>
                            <Chip icon="calendar" style={styles.detailChip}>{formatDate(transaction.date)}</Chip>
                          </View>
                        </View>
                        
                        <View style={styles.transactionRight}>
                          <Text style={[
                            styles.transactionAmount,
                            { color: transaction.type === 'income' ? theme.colors.primary : theme.colors.error }
                          ]}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrencyValue(
                              Math.abs(transaction.amount),
                              transaction.currency || trip?.defaultCurrency || 'USD'
                            )}
                          </Text>
                          
                          <IconButton
                            icon="delete-outline"
                            size={20}
                            onPress={() => handleDeleteTransaction(transaction.id)}
                            style={styles.deleteButton}
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
          <Card style={[styles.card, { borderColor: theme.colors.primary, borderWidth: 1 }]}>
            <Card.Title title="Confirmações Pendentes" subtitle="Recorrentes aguardando aplicação" />
            <Card.Content>
              {dueRecurrences.map(r => (
                <View key={r.id} style={styles.recurringRow}>
                  <View style={styles.recurringInfo}>
                    <Text style={styles.recurringText}>
                      {r.description || `${r.frequency} - ${r.type === 'expense' ? 'Gasto' : 'Receita'}`}
                    </Text>
                    <Text style={styles.recurringAmount}>{formatCurrency(r.amount)}</Text>
                  </View>
                  <Button 
                    mode="contained" 
                    onPress={() => setConfirmDialog({ visible: true, recurring: r })}
                    style={{ borderRadius: 10 }}
                  >
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
        fabStyle={{ backgroundColor: theme.colors.primary }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  activeChip: {
    backgroundColor: '#E8F5E9',
  },
  activeChipText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pill: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  pillSoft: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  budgetLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
    paddingVertical: 4,
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  divider: {
    marginVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  transactionDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  detailChip: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: -4,
    marginRight: -8,
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recurringInfo: {
    flex: 1,
  },
  recurringText: {
    fontSize: 16,
  },
  recurringAmount: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 80,
  },
  fabGroup: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TripDetailScreen;
