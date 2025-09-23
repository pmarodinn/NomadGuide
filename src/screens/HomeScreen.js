import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Text, 
  Chip, 
  useTheme,
  IconButton,
  TextInput,
  Snackbar,
  Button,
  Portal,
  Dialog,
  List,
  RadioButton
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTripContext } from '../contexts/TripContext';
import { useMedicationContext } from '../contexts/MedicationContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { authService } from '../services/authService';
import { formatCurrency, getBalanceColor } from '../utils/currencyUtils';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { requestNotificationPermissions } from '../services/notifications';
import LoadingScreen from '../components/ui/LoadingScreen';
import CustomButton from '../components/ui/CustomButton';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { 
    trips,
    transactions, 
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
  
  const { formatCurrency: formatCurrencyValue, getSupportedCurrencies } = useCurrencyContext();

  // Quick add state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [selectedQuickCurrency, setSelectedQuickCurrency] = useState('USD');
  const [showQuickCurrencyDialog, setShowQuickCurrencyDialog] = useState(false);

  const showSnack = (message) => setSnackbar({ visible: true, message });

  // Get active trip and related data
  const activeTrip = getActiveTrip();
  // Initialize quick currency to trip default whenever trip changes
  useEffect(() => {
    if (activeTrip?.defaultCurrency) {
      setSelectedQuickCurrency(activeTrip.defaultCurrency);
    }
  }, [activeTrip?.defaultCurrency]);
  const realBalance = activeTrip ? getTripBalance(activeTrip.id) : 0;
  const projectedBalance = activeTrip ? getProjectedBalance(activeTrip.id) : 0;

  const getDaysRemaining = (end) => {
    if (!end) return 0;
    const endDate = end?.toDate ? end.toDate() : new Date(end);
    const today = new Date();
    // normalizar para meia-noite
    endDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffMs = endDate.getTime() - today.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusivo
    return Math.max(0, days);
  };

  const daysRemaining = activeTrip ? getDaysRemaining(activeTrip.endDate) : 0;
  const realDaily = daysRemaining > 0 ? Math.max(0, realBalance / daysRemaining) : 0;
  const projectedDaily = daysRemaining > 0 ? Math.max(0, projectedBalance / daysRemaining) : 0;

  const activeTripTransactions = activeTrip ? transactions.filter(t => t.tripId === activeTrip.id) : [];
  const recentTransactions = activeTripTransactions.slice(0, 3);

  // Request notification permissions on first load
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  if (authLoading || !user) {
    return <LoadingScreen message="Conectando..." />;
  }

  const loading = tripLoading || medicationLoading;

  const handleQuickAddExpense = () => {
    if (!activeTrip) {
      Alert.alert(
        'Nenhuma Viagem Ativa',
        'Crie uma viagem primeiro para adicionar transações.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar Viagem', onPress: () => navigation.navigate('TripList') }
        ]
      );
      return;
    }
    
    navigation.navigate('AddTransaction', { 
      tripId: activeTrip.id,
      type: 'expense' 
    });
  };

  const handleQuickAddReal = async (type) => {
    if (!activeTrip) return handleQuickAddExpense();
    const value = parseFloat(String(quickAmount).replace(',', '.'));
    if (!value || isNaN(value) || value <= 0) {
      return showSnack('Informe um valor válido');
    }
    try {
      setQuickLoading(true);
      await addTransaction({
        tripId: activeTrip.id,
        amount: value,
        type, // 'expense' | 'income'
        description: '',
        categoryId: null,
        currency: selectedQuickCurrency || activeTrip?.defaultCurrency || 'USD',
        date: new Date(),
      });
      setQuickAmount('');
      showSnack('Transação adicionada');
    } catch (e) {
      showSnack('Erro ao adicionar. Tente novamente.');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleQuickAddRecurring = () => {
    if (!activeTrip) {
      Alert.alert(
        'Nenhuma Viagem Ativa',
        'Crie uma viagem primeiro para adicionar transações recorrentes.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar Viagem', onPress: () => navigation.navigate('TripList') }
        ]
      );
      return;
    }

    navigation.navigate('AddRecurringTransaction', {
      tripId: activeTrip.id,
    });
  };

  const handleMedicationReminder = (medication) => {
    Alert.alert(
      '💊 Lembrete de Medicamento',
      `É hora de tomar ${medication.name} (${medication.dosage})`,
      [
        { text: 'Mais Tarde', style: 'cancel' },
        { 
          text: 'Tomei', 
          onPress: () => {
            // TODO: Mark medication as taken
            navigation.navigate('MedicationList');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <Card style={[styles.card, styles.welcomeCard]}> 
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <View>
                <Title style={styles.welcomeTitle}>
                  Olá, Viajante! ✈️
                </Title>
                <Paragraph style={styles.welcomeSubtitle}>
                  Gerencie suas viagens e medicamentos
                </Paragraph>
              </View>
              <IconButton
                icon="cog"
                size={24}
                onPress={() => navigation.navigate('CurrencySettings')}
                tooltip="Configurações"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Active Trip Summary */}
        {activeTrip ? (
          <Card style={[styles.card, styles.elevated]}> 
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>🧳 {activeTrip.name}</Title>
                <Chip icon="calendar" mode="outlined">
                  {formatDate(activeTrip.startDate)} — {formatDate(activeTrip.endDate)}
                </Chip>
              </View>
              
              {/* Saldos principais */}
              <View style={styles.balanceContainer}>
                <View style={[styles.balanceItem, styles.pill]}> 
                  <Text style={styles.balanceLabel}>Saldo Real</Text>
                  <Text style={[styles.balanceValue, { color: getBalanceColor(realBalance) }]}>
                    {formatCurrencyValue(realBalance, activeTrip?.defaultCurrency || 'USD')}
                  </Text>
                </View>
                
                <View style={[styles.balanceItem, styles.pill]}> 
                  <Text style={styles.balanceLabel}>Saldo Projetado</Text>
                  <Text style={[styles.balanceValue, { color: getBalanceColor(projectedBalance) }]}>
                    {formatCurrencyValue(projectedBalance, activeTrip?.defaultCurrency || 'USD')}
                  </Text>
                </View>
              </View>

              {/* Diários */}
              <View style={styles.balanceContainer}>
                <View style={[styles.balanceItem, styles.pillSoft]}> 
                  <Text style={styles.balanceLabel}>Diário (Real)</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrencyValue(realDaily, activeTrip?.defaultCurrency || 'USD')}
                  </Text>
                </View>
                <View style={[styles.balanceItem, styles.pillSoft]}> 
                  <Text style={styles.balanceLabel}>Diário (Projetado)</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrencyValue(projectedDaily, activeTrip?.defaultCurrency || 'USD')}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}> 
            <Card.Content style={styles.emptyState}>
              <Title>✈️ Nenhuma Viagem Ativa</Title>
              <Paragraph style={styles.emptyStateText}>
                Crie sua primeira viagem para começar a gerenciar seus gastos
              </Paragraph>
              <CustomButton
                title="Criar Viagem"
                onPress={() => navigation.navigate('TripList')}
                icon="plus"
              />
            </Card.Content>
          </Card>
        )}

        {/* Lançamento Rápido */}
        {activeTrip && (
          <Card style={[styles.card, styles.quickCard]}> 
            <Card.Content>
              <Title>⚡ Lançamento Rápido</Title>
              <Paragraph style={{ opacity: 0.7 }}>Sem categoria e descrição — direto no saldo</Paragraph>
              <View style={styles.quickRow}>
                <View style={styles.quickLeft}>
                  <TextInput
                    mode="outlined"
                    label={`Valor (${selectedQuickCurrency || activeTrip?.defaultCurrency || 'USD'})`}
                    value={quickAmount}
                    onChangeText={setQuickAmount}
                    keyboardType="decimal-pad"
                    style={styles.quickInput}
                    left={<TextInput.Icon icon="currency-usd" />}
                  />
                  <Button
                    mode="outlined"
                    onPress={() => setShowQuickCurrencyDialog(true)}
                    style={styles.quickCurrencyButton}
                    icon="currency-usd"
                  >
                    {(() => {
                      const currency = (getSupportedCurrencies() || []).find(c => c.code === (selectedQuickCurrency || activeTrip?.defaultCurrency));
                      return `${currency?.flag || ''} ${currency?.code || selectedQuickCurrency || activeTrip?.defaultCurrency || 'USD'}`;
                    })()}
                  </Button>
                </View>
                <View style={styles.quickButtons}>
                  <Button
                    mode="contained"
                    icon="minus-circle"
                    onPress={() => handleQuickAddReal('expense')}
                    loading={quickLoading}
                    disabled={quickLoading}
                    style={[styles.quickBtn, { backgroundColor: theme.colors.secondary }]}
                    labelStyle={styles.quickBtnLabel}
                  >
                    Gastar
                  </Button>
                  <Button
                    mode="contained"
                    icon="plus-circle"
                    onPress={() => handleQuickAddReal('income')}
                    loading={quickLoading}
                    disabled={quickLoading}
                    style={[styles.quickBtn, { backgroundColor: theme.colors.primary }]}
                    labelStyle={styles.quickBtnLabel}
                  >
                    Receber
                  </Button>
                </View>
              </View>

              {/* Quick currency selection dialog */}
              <Portal>
                <Dialog visible={showQuickCurrencyDialog} onDismiss={() => setShowQuickCurrencyDialog(false)}>
                  <Dialog.Title>Selecionar Moeda</Dialog.Title>
                  <Dialog.ScrollArea>
                    <ScrollView style={{ maxHeight: 320 }}>
                      {(() => {
                        const all = getSupportedCurrencies() || [];
                        const tripCode = activeTrip?.defaultCurrency;
                        const first = all.find(c => c.code === (tripCode || selectedQuickCurrency));
                        const rest = all.filter(c => c.code !== (tripCode || selectedQuickCurrency));
                        const ordered = first ? [first, ...rest] : all;
                        return ordered.map((currency) => (
                          <List.Item
                            key={currency.code}
                            title={`${currency.flag} ${currency.code} - ${currency.name}`}
                            right={() => (
                              <RadioButton
                                value={currency.code}
                                status={(selectedQuickCurrency || tripCode) === currency.code ? 'checked' : 'unchecked'}
                                onPress={() => { setSelectedQuickCurrency(currency.code); setShowQuickCurrencyDialog(false); }}
                              />
                            )}
                            onPress={() => { setSelectedQuickCurrency(currency.code); setShowQuickCurrencyDialog(false); }}
                          />
                        ));
                      })()}
                    </ScrollView>
                  </Dialog.ScrollArea>
                  <Dialog.Actions>
                    <Button onPress={() => setShowQuickCurrencyDialog(false)}>Fechar</Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </Card.Content>
          </Card>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <Card style={styles.card}> 
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>📊 Transações Recentes</Title>
                <CustomButton
                  title="Ver Todas"
                  mode="outlined"
                  onPress={() => navigation.navigate('TripDetail', { 
                    tripId: activeTrip.id 
                  })}
                  style={styles.smallButton}
                  contentStyle={styles.smallButtonContent}
                />
              </View>

              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {getRelativeTime(transaction.date)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrencyValue(transaction.amount, transaction.currency || activeTrip?.defaultCurrency || 'USD')}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Medication Reminders */}
        {medicationsDueSoon.length > 0 && (
          <Card style={[styles.card, styles.medicationCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>💊 Medicamentos</Title>
                <CustomButton
                  title="Ver Todos"
                  mode="outlined"
                  onPress={() => navigation.navigate('MedicationList')}
                  style={styles.smallButton}
                  contentStyle={styles.smallButtonContent}
                />
              </View>

              <Paragraph style={styles.medicationSubtitle}>
                {medicationsDueSoon.length} medicamento(s) nas próximas 2 horas
              </Paragraph>

              {medicationsDueSoon.map((medication) => (
                <View key={medication.id} style={styles.medicationItem}>
                  <View style={styles.medicationContent}>
                    <Text style={styles.medicationName}>
                      {medication.name}
                    </Text>
                    <Text style={styles.medicationDosage}>
                      {medication.dosage}
                    </Text>
                    <Text style={styles.medicationTime}>
                      {getRelativeTime(medication.nextAlarm)}
                    </Text>
                  </View>
                  <CustomButton
                    title="Tomei"
                    mode="contained"
                    onPress={() => handleMedicationReminder(medication)}
                    style={styles.medicationButton}
                    contentStyle={styles.smallButtonContent}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Medication Status */}
        {activeMedications.length > 0 && medicationsDueSoon.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>💊 Medicamentos</Title>
                <CustomButton
                  title="Gerenciar"
                  mode="outlined"
                  onPress={() => navigation.navigate('MedicationList')}
                  style={styles.smallButton}
                  contentStyle={styles.smallButtonContent}
                />
              </View>
              <View style={styles.medicationStatus}>
                <Chip icon="check" mode="outlined">
                  {activeMedications.length} ativo(s)
                </Chip>
                <Text style={styles.medicationStatusText}>
                  Tudo em dia! ✅
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Ações Rápidas */}
        <Card style={styles.card}> 
          <Card.Content>
            <Title>⚙️ Ações</Title>
            <View style={styles.quickActions}>
              <CustomButton
                title="Transações"
                mode="outlined"
                icon="format-list-bulleted"
                onPress={() => activeTrip ? navigation.navigate('TripDetail', { tripId: activeTrip.id }) : navigation.navigate('TripList')}
                style={styles.quickActionButton}
              />
              <CustomButton
                title="Recorrentes"
                mode="outlined"
                icon="refresh"
                onPress={() => activeTrip ? navigation.navigate('Recurrence') : navigation.navigate('TripList')}
                style={styles.quickActionButton}
              />
              <CustomButton
                title="Ver Gráficos"
                mode="outlined"
                icon="chart-line"
                onPress={() => activeTrip ? navigation.navigate('DailySpending', { tripId: activeTrip.id }) : navigation.navigate('DailySpending')}
                style={styles.quickActionButton}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button (atalhos) */}
      <View style={styles.fabContainer}>
        <FAB
          style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
          icon="cash"
          label="Transação Simples"
          onPress={handleQuickAddExpense}
        />
        <FAB
          style={[styles.fabButton, { backgroundColor: theme.colors.secondary, marginTop: 12 }]}
          icon="refresh"
          label="Transação Recorrente"
          onPress={handleQuickAddRecurring}
        />
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={2500}
      >
        {snackbar.message}
      </Snackbar>
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  welcomeCard: {
    marginTop: 8,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallButton: {
    minWidth: 80,
  },
  smallButtonContent: {
    paddingVertical: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
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
  tripDates: {
    alignItems: 'center',
    marginTop: 8,
  },
  tripDateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  medicationSubtitle: {
    opacity: 0.7,
    marginBottom: 12,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  medicationContent: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  medicationDosage: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  medicationTime: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2,
  },
  medicationButton: {
    minWidth: 80,
  },
  medicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationStatusText: {
    fontSize: 16,
    opacity: 0.7,
  },
  quickCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  quickLeft: {
    flex: 1,
  },
  quickInput: {
    flex: 1,
    marginRight: 8,
  },
  quickCurrencyButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  quickButtons: {
    width: 160,
    justifyContent: 'space-between',
  },
  quickBtn: {
    marginBottom: 8,
    borderRadius: 10,
  },
  quickBtnLabel: {
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabButton: {
    // relative inside absolute container to allow stacking
    borderRadius: 14,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 16,
    alignItems: 'flex-end',
  },
});

export default HomeScreen;
