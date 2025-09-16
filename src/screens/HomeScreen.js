import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  FAB, 
  Text, 
  Chip, 
  useTheme,
  IconButton
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { useMedication } from '../contexts/MedicationContext';
import { formatCurrency, getBalanceColor } from '../utils/currencyUtils';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { requestNotificationPermissions } from '../services/notifications';
import LoadingScreen from '../components/ui/LoadingScreen';
import CustomButton from '../components/ui/CustomButton';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { 
    activeTrip, 
    realBalance, 
    projectedBalance, 
    transactions, 
    loading: tripLoading 
  } = useTrip();
  const { 
    medicationsDueSoon, 
    activeMedications, 
    loading: medicationLoading 
  } = useMedication();

  // Request notification permissions on first load
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  if (authLoading || !user) {
    return <LoadingScreen message="Conectando..." />;
  }

  const loading = tripLoading || medicationLoading;

  const recentTransactions = transactions.slice(0, 3);

  const handleQuickAddExpense = () => {
    if (!activeTrip) {
      Alert.alert(
        'Nenhuma Viagem Ativa',
        'Crie uma viagem primeiro para adicionar gastos.',
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
                onPress={() => {
                  // TODO: Navigate to settings
                  Alert.alert('Em Breve', 'Configurações serão implementadas em breve!');
                }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Active Trip Summary */}
        {activeTrip ? (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title>🧳 {activeTrip.name}</Title>
                <CustomButton
                  title="Detalhes"
                  mode="outlined"
                  onPress={() => navigation.navigate('TripDetail', { 
                    tripId: activeTrip.id,
                    tripName: activeTrip.name 
                  })}
                  style={styles.smallButton}
                  contentStyle={styles.smallButtonContent}
                />
              </View>
              
              <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Saldo Real</Text>
                  <Text style={[
                    styles.balanceValue, 
                    { color: getBalanceColor(realBalance) }
                  ]}>
                    {formatCurrency(realBalance)}
                  </Text>
                </View>
                
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Saldo Projetado</Text>
                  <Text style={[
                    styles.balanceValue, 
                    { color: getBalanceColor(projectedBalance) }
                  ]}>
                    {formatCurrency(projectedBalance)}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDates}>
                <Text style={styles.tripDateText}>
                  📅 {formatDate(activeTrip.startDate)} - {formatDate(activeTrip.endDate)}
                </Text>
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
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
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

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>⚡ Ações Rápidas</Title>
            <View style={styles.quickActions}>
              <CustomButton
                title="Ver Gráficos"
                mode="outlined"
                icon="chart-line"
                onPress={() => navigation.navigate('DailySpending')}
                style={styles.quickActionButton}
              />
              <CustomButton
                title="Gerenciar Viagens"
                mode="outlined"
                icon="map"
                onPress={() => navigation.navigate('TripList')}
                style={styles.quickActionButton}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleQuickAddExpense}
        label="Gasto"
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
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
    marginBottom: 16,
  },
  smallButton: {
    minWidth: 80,
  },
  smallButtonContent: {
    paddingVertical: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  balanceItem: {
    alignItems: 'center',
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
});

export default HomeScreen;
