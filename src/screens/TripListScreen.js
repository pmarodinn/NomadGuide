import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Dimensions, KeyboardAvoidingView, SafeAreaView, StatusBar } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  FAB, 
  Button, 
  Chip,
  Dialog,
  Portal,
  TextInput,
  Menu,
  Divider,
  Text,
  Surface,
  IconButton
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { colors, spacing, borderRadius, typography, elevation } from '../theme/colors';
import { 
  BalanceCard, 
  QuickActionButton, 
  SectionHeader, 
  CardContainer 
} from '../components/BankingComponents';

const TripListScreen = ({ navigation }) => {
  const { trips, loading, createTrip, updateTrip, activateTrip, getTripBalance, getProjectedBalance, getActiveTrip } = useTripContext();
  const activeTrip = getActiveTrip();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, detectCurrencyByCountry, convertCurrency } = useCurrencyContext();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showBudgetCurrencyMenu, setShowBudgetCurrencyMenu] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [newTripData, setNewTripData] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);
    
    return {
      name: '',
      budget: '',
      startDate: today,
      endDate: nextWeek,
      description: '',
      defaultCurrency: 'USD'
    };
  });

  const handleCreateTrip = async () => {
    if (!newTripData.name.trim() || !newTripData.budget.trim()) {
      Alert.alert('Erro', 'Preencha nome e orçamento da viagem');
      return;
    }

    const budget = parseFloat(newTripData.budget.replace(',', '.'));
    if (isNaN(budget) || budget <= 0) {
      Alert.alert('Erro', 'Digite um orçamento válido');
      return;
    }

    try {
      let finalBudget = budget;
      if (budgetCurrency !== newTripData.defaultCurrency) {
        try {
          finalBudget = await convertCurrency(budget, budgetCurrency, newTripData.defaultCurrency);
        } catch (conversionError) {
          console.error('Error converting budget currency:', conversionError);
          Alert.alert('Aviso', 'Não foi possível converter a moeda. Usando valor original.');
        }
      }

      await createTrip({
        name: newTripData.name.trim(),
        budget: finalBudget,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate,
        description: newTripData.description.trim(),
        defaultCurrency: newTripData.defaultCurrency,
        isActive: true,
        createdAt: new Date()
      });

      setShowCreateDialog(false);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(0, 0, 0, 0);
      
      setNewTripData({
        name: '',
        budget: '',
        startDate: today,
        endDate: nextWeek,
        description: '',
        defaultCurrency: 'USD'
      });
      setBudgetCurrency('USD');

      Alert.alert('Sucesso', 'Viagem criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      Alert.alert('Erro', 'Não foi possível criar a viagem');
    }
  };

  const calculateTripDuration = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleActivateTrip = async (trip) => {
    try {
      await activateTrip(trip.id);
      Alert.alert('Sucesso', `Viagem "${trip.name}" ativada!`);
    } catch (error) {
      console.error('Erro ao ativar viagem:', error);
      Alert.alert('Erro', 'Não foi possível ativar a viagem');
    }
  };

  const navigateToQuickExpense = () => {
    const active = trips.find(t => t.isActive);
    if (!active) {
      Alert.alert('Ative uma viagem', 'Você precisa ativar uma viagem para adicionar transações.');
      return;
    }
    navigation.navigate('AddTransaction', { tripId: active.id });
  };

  const navigateToRecurring = () => {
    const active = trips.find(t => t.isActive);
    if (!active) {
      Alert.alert('Ative uma viagem', 'Você precisa ativar uma viagem para adicionar transações recorrentes.');
      return;
    }
    navigation.navigate('AddRecurringTransaction', { tripId: active.id });
  };

  const handleOpenCreateDialog = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);
    
    setNewTripData({
      name: '',
      budget: '',
      startDate: today,
      endDate: nextWeek,
      description: '',
      defaultCurrency: 'USD'
    });
    setBudgetCurrency('USD');
    setShowCreateDialog(true);
  };

  const TripCard = ({ trip }) => (
    <CardContainer style={[styles.tripCard, trip.isActive && styles.activeTrip]}>
      <View style={styles.tripHeader}>
        <View style={styles.tripTitleRow}>
          <Text style={styles.tripTitle}>{trip.name}</Text>
          {trip.isActive && <Chip mode="flat" style={styles.activeChip}>ATIVA</Chip>}
        </View>
        
        <View style={styles.balanceRow}>
          <BalanceCard
            title="Orçamento"
            balance={formatCurrencyValue(trip.budget, trip.defaultCurrency || 'USD')}
            type="primary"
            style={styles.budgetCard}
          />
          <BalanceCard
            title="Restante"
            balance={formatCurrencyValue(getTripBalance(trip.id), trip.defaultCurrency || 'USD')}
            type={getTripBalance(trip.id) >= 0 ? "success" : "error"}
            style={styles.remainingCard}
          />
        </View>
        
        <View style={styles.tripMeta}>
          <Text style={styles.tripDates}>
            {formatDate(trip.startDate?.toDate?.() || trip.startDate)} - {formatDate(trip.endDate?.toDate?.() || trip.endDate)}
          </Text>
          <Text style={styles.tripDuration}>
            {calculateTripDuration(trip.startDate?.toDate?.() || trip.startDate, trip.endDate?.toDate?.() || trip.endDate)} dias
          </Text>
        </View>
        
        {trip.description && (
          <Text style={styles.tripDescription}>{trip.description}</Text>
        )}
        
        <View style={styles.tripActions}>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('TripDetail', { 
              tripId: trip.id, 
              tripName: trip.name 
            })}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Ver Extrato
          </Button>
          
          {!trip.isActive && (
            <Button 
              mode="contained" 
              onPress={() => handleActivateTrip(trip)}
              style={[styles.actionButton, styles.activateButton]}
              contentStyle={styles.actionButtonContent}
            >
              Ativar
            </Button>
          )}
        </View>
      </View>
    </CardContainer>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header with active trip overview */}
      {activeTrip && (
        <Surface style={styles.headerSurface}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Viagem Ativa</Text>
            <Text style={styles.tripNameHeader}>{activeTrip.name}</Text>
            
            <View style={styles.quickBalanceRow}>
              <BalanceCard
                title="Saldo Atual"
                balance={formatCurrencyValue(getTripBalance(activeTrip.id), activeTrip.defaultCurrency || 'USD')}
                type={getTripBalance(activeTrip.id) >= 0 ? "success" : "error"}
                style={styles.headerBalanceCard}
              />
              <BalanceCard
                title="Projetado"
                balance={formatCurrencyValue(getProjectedBalance(activeTrip.id), activeTrip.defaultCurrency || 'USD')}
                type="secondary"
                style={styles.headerBalanceCard}
              />
            </View>
          </View>
        </Surface>
      )}
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <CardContainer style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsRow}>
            <QuickActionButton
              icon="+"
              title="Gasto"
              onPress={navigateToQuickExpense}
              color={colors.error}
            />
            <QuickActionButton
              icon="↻"
              title="Recorrente"
              onPress={navigateToRecurring}
              color={colors.secondary}
            />
            <QuickActionButton
              icon="○"
              title="Medicamentos"
              onPress={() => navigation.navigate('Medications')}
              color={colors.warning}
            />
            <QuickActionButton
              icon="+"
              title="Nova Viagem"
              onPress={handleOpenCreateDialog}
              color={colors.primary}
            />
          </View>
        </CardContainer>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Suas Viagens" />
        
        {trips.length === 0 ? (
          <CardContainer style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Nenhuma Viagem Encontrada</Text>
              <Text style={styles.emptyText}>
                Crie sua primeira viagem para começar a controlar seus gastos!
              </Text>
            </View>
          </CardContainer>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Trip Dialog - Simplified */}
      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)} style={styles.dialog}>
          <Dialog.Title>Nova Viagem</Dialog.Title>
          <Dialog.ScrollArea>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                <TextInput
                  label="Nome da Viagem"
                  value={newTripData.name}
                  onChangeText={(text) => setNewTripData(prev => ({ ...prev, name: text }))}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Orçamento"
                  value={newTripData.budget}
                  onChangeText={(text) => setNewTripData(prev => ({ ...prev, budget: text }))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Descrição (opcional)"
                  value={newTripData.description}
                  onChangeText={(text) => setNewTripData(prev => ({ ...prev, description: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateTrip}>Criar</Button>
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
  
  // Header Styles
  headerSurface: {
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...elevation.level2,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.labelLarge,
    color: colors.backgroundSecondary,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  tripNameHeader: {
    ...typography.headlineLarge,
    color: colors.backgroundSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  quickBalanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  headerBalanceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Quick Actions Styles
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickActionsCard: {
    backgroundColor: colors.backgroundSecondary,
  },
  quickActionsTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // ScrollView
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Trip Card Styles
  tripCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  activeTrip: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  tripHeader: {
    gap: spacing.md,
  },
  tripTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripTitle: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    flex: 1,
  },
  activeChip: {
    backgroundColor: colors.successContainer,
    borderColor: colors.success,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  budgetCard: {
    flex: 1,
  },
  remainingCard: {
    flex: 1,
  },
  tripMeta: {
    gap: spacing.xs,
  },
  tripDates: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  tripDuration: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '500',
  },
  tripDescription: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  tripActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: spacing.xs,
  },
  activateButton: {
    backgroundColor: colors.primary,
  },
  
  // Empty State
  emptyCard: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Dialog Styles
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  dialog: {
    backgroundColor: colors.backgroundSecondary,
    maxHeight: Math.round(Dimensions.get('window').height * 0.85),
  },
  
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default TripListScreen;
