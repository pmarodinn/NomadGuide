import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Dimensions, KeyboardAvoidingView } from 'react-native';
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
  Text
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';

const TripListScreen = ({ navigation }) => {
  const { trips, activeTrip, loading, createTrip, updateTrip, activateTrip } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, detectCurrencyByCountry, convertCurrency } = useCurrencyContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showBudgetCurrencyMenu, setShowBudgetCurrencyMenu] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [newTripData, setNewTripData] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para evitar problemas
    
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
      // Convert budget from input currency to trip currency if different
      let finalBudget = budget;
      if (budgetCurrency !== newTripData.defaultCurrency) {
        try {
          finalBudget = await convertCurrency(budget, budgetCurrency, newTripData.defaultCurrency);
        } catch (conversionError) {
          console.error('Error converting budget currency:', conversionError);
          Alert.alert('Aviso', 'Não foi possível converter a moeda. Usando valor original.');
        }
      }

      // Criar nova viagem (o contexto já gerencia userId e ativação)
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
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);

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

  const handleStartDateChange = (event, selectedDate) => {
    console.log('handleStartDateChange called with:', event?.type, selectedDate);
    
    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';
    
    if (isAndroid) {
      setShowStartDatePicker(false);
    }
    
    if (selectedDate && event?.type !== 'dismissed') {
      const newStartDate = new Date(selectedDate);
      newStartDate.setHours(0, 0, 0, 0); // Normalizar a hora
      
      console.log('Setting new start date:', newStartDate);
      console.log('Current end date:', newTripData.endDate);
      
      // Se a data final for anterior à nova data inicial, ajustar
      let newEndDate = newTripData.endDate;
      if (newStartDate >= newTripData.endDate) {
        newEndDate = new Date(newStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        newEndDate.setHours(0, 0, 0, 0);
        console.log('Adjusted end date to:', newEndDate);
      }
      
      setNewTripData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate
      }));
    } else if (event?.type === 'dismissed') {
      console.log('Start date picker dismissed');
    }
    
    if (isIOS) {
      setShowStartDatePicker(false);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    console.log('handleEndDateChange called with:', event?.type, selectedDate);
    
    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';
    
    if (isAndroid) {
      setShowEndDatePicker(false);
    }
    
    if (selectedDate && event?.type !== 'dismissed') {
      const newEndDate = new Date(selectedDate);
      newEndDate.setHours(0, 0, 0, 0); // Normalizar a hora
      
      console.log('Setting new end date:', newEndDate);
      console.log('Current start date:', newTripData.startDate);
      
      // Verificar se a data final é posterior à data inicial
      if (newEndDate >= newTripData.startDate) {
        console.log('Valid end date, updating state');
        setNewTripData(prev => ({ ...prev, endDate: newEndDate }));
      } else {
        // Se a data final for anterior à inicial, mostrar aviso
        console.log('Invalid end date - before start date');
        Alert.alert('Data Inválida', 'A data final deve ser posterior à data inicial.');
      }
    } else if (event?.type === 'dismissed') {
      console.log('End date picker dismissed');
    }
    
    if (isIOS) {
      setShowEndDatePicker(false);
    }
  };

  const handleOpenCreateDialog = () => {
    // Reset form data with fresh dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para evitar problemas
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);
    
    console.log('Opening dialog with dates:', { startDate: today, endDate: nextWeek });
    
    setNewTripData({
      name: '',
      budget: '',
      startDate: today,
      endDate: nextWeek,
      description: '',
      defaultCurrency: 'USD'
    });
    setBudgetCurrency('USD');
    setShowCurrencyMenu(false);
    setShowBudgetCurrencyMenu(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowCreateDialog(true);
  };

  const handleActivateTrip = async (trip) => {
    try {
      // Usar a função de ativação do contexto que já gerencia tudo
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

  const TripCard = ({ trip }) => (
    <Card style={[styles.tripCard, trip.isActive && styles.activeTrip]}>
      <Card.Content>
        <View style={styles.tripHeader}>
          <Title style={styles.tripTitle}>{trip.name}</Title>
          {trip.isActive && <Chip mode="flat" textStyle={styles.activeChip}>ATIVA</Chip>}
        </View>
        
        <Paragraph style={styles.tripBudget}>
          💰 Orçamento: {formatCurrencyValue(trip.budget, trip.defaultCurrency || 'USD')}
        </Paragraph>
        
        <Paragraph style={styles.tripDates}>
          📅 {formatDate(trip.startDate?.toDate?.() || trip.startDate)} - {formatDate(trip.endDate?.toDate?.() || trip.endDate)}
        </Paragraph>
        
        <Paragraph style={styles.tripDuration}>
          ⏱️ Duração: {calculateTripDuration(trip.startDate?.toDate?.() || trip.startDate, trip.endDate?.toDate?.() || trip.endDate)}
        </Paragraph>
        
        {trip.description && (
          <Paragraph style={styles.tripDescription}>
            📝 {trip.description}
          </Paragraph>
        )}
        
        <View style={styles.tripActions}>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('TripDetail', { 
              tripId: trip.id, 
              tripName: trip.name 
            })}
            style={styles.actionButton}
          >
            Ver Detalhes
          </Button>
          
          {!trip.isActive && (
            <Button 
              mode="contained" 
              onPress={() => handleActivateTrip(trip)}
              style={styles.actionButton}
            >
              Ativar
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Android pickers: open native modal to avoid conflicts with Paper Dialog
  const openAndroidStartPicker = () => {
    DateTimePickerAndroid.open({
      value: newTripData.startDate,
      mode: 'date',
      onChange: (event, selectedDate) => {
        if (event?.type !== 'dismissed' && selectedDate) {
          const newStartDate = new Date(selectedDate);
          newStartDate.setHours(0, 0, 0, 0);

          let newEndDate = newTripData.endDate;
          if (newStartDate >= newEndDate) {
            newEndDate = new Date(newStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            newEndDate.setHours(0, 0, 0, 0);
          }

          setNewTripData(prev => ({
            ...prev,
            startDate: newStartDate,
            endDate: newEndDate,
          }));
        }
      },
      // minimumDate: new Date(), // enable if you want to block past dates
      // maximumDate: new Date(new Date().getFullYear() + 2, 11, 31),
    });
  };

  const openAndroidEndPicker = () => {
    DateTimePickerAndroid.open({
      value: newTripData.endDate,
      mode: 'date',
      onChange: (event, selectedDate) => {
        if (event?.type !== 'dismissed' && selectedDate) {
          const newEndDate = new Date(selectedDate);
          newEndDate.setHours(0, 0, 0, 0);

          if (newEndDate >= newTripData.startDate) {
            setNewTripData(prev => ({ ...prev, endDate: newEndDate }));
          } else {
            Alert.alert('Data Inválida', 'A data final deve ser posterior à data inicial.');
          }
        }
      },
      minimumDate: newTripData.startDate,
      // maximumDate: new Date(new Date().getFullYear() + 2, 11, 31),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {trips.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>✈️ Nenhuma Viagem Encontrada</Title>
              <Paragraph style={styles.emptyText}>
                Crie sua primeira viagem para começar a controlar seus gastos!
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick action FABs for expense and recurring */}
      <FAB
        style={[styles.fabSecondary, { bottom: 96 }]}
        small
        icon="cash-plus"
        label="Gasto"
        onPress={navigateToQuickExpense}
      />

      <FAB
        style={[styles.fabSecondary, { bottom: 160 }]}
        small
        icon="refresh"
        label="Recorrente"
        onPress={navigateToRecurring}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Viagem"
        onPress={handleOpenCreateDialog}
      />

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => {
          setShowCreateDialog(false);
          setShowCurrencyMenu(false);
          setShowBudgetCurrencyMenu(false);
          setBudgetCurrency('USD');
        }} style={styles.dialog}>
          <Dialog.Title>✈️ Nova Viagem</Dialog.Title>
          <Dialog.ScrollArea>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={64}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                contentContainerStyle={styles.dialogScrollContent}
              >
                <TextInput
                  label="Nome da Viagem"
                  value={newTripData.name}
                  onChangeText={(text) => setNewTripData(prev => ({ ...prev, name: text }))}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label={`Orçamento em ${budgetCurrency}`}
                  value={newTripData.budget}
                  onChangeText={(text) => setNewTripData(prev => ({ ...prev, budget: text }))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                />
                
                <Text style={styles.sectionTitle}>Moeda do Orçamento</Text>
                <Menu
                  visible={showBudgetCurrencyMenu}
                  onDismiss={() => setShowBudgetCurrencyMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowBudgetCurrencyMenu(true)}
                      style={styles.currencyButton}
                      contentStyle={styles.currencyButtonContent}
                      icon="cash"
                    >
                      {(() => {
                        const currency = getSupportedCurrencies().find(c => c.code === budgetCurrency);
                        return `${currency?.flag || '💰'} ${budgetCurrency} - ${currency?.name || 'Dólar Americano'}`;
                      })()}
                    </Button>
                  }
                >
                  <ScrollView style={{ maxHeight: 300 }}>
                    {getSupportedCurrencies().map((currency) => (
                      <Menu.Item
                        key={currency.code}
                        onPress={() => {
                          setBudgetCurrency(currency.code);
                          setShowBudgetCurrencyMenu(false);
                        }}
                        title={`${currency.flag} ${currency.code} - ${currency.name}`}
                        titleStyle={currency.code === budgetCurrency ? { fontWeight: 'bold' } : {}}
                      />
                    ))}
                  </ScrollView>
                </Menu>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Moeda da Viagem</Text>
                <Menu
                  visible={showCurrencyMenu}
                  onDismiss={() => setShowCurrencyMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowCurrencyMenu(true)}
                      style={styles.currencyButton}
                      contentStyle={styles.currencyButtonContent}
                      icon="currency-usd"
                    >
                      {(() => {
                        const currency = getSupportedCurrencies().find(c => c.code === newTripData.defaultCurrency);
                        return `${currency?.flag || ''} ${currency?.code || 'USD'} - ${currency?.name || 'Dólar Americano'}`;
                      })()}
                    </Button>
                  }
                >
                  <ScrollView style={{ maxHeight: 300 }}>
                    {getSupportedCurrencies().map((currency) => (
                      <Menu.Item
                        key={currency.code}
                        onPress={() => {
                          setNewTripData(prev => ({ ...prev, defaultCurrency: currency.code }));
                          setShowCurrencyMenu(false);
                        }}
                        title={`${currency.flag} ${currency.code} - ${currency.name}`}
                        titleStyle={currency.code === newTripData.defaultCurrency ? { fontWeight: 'bold' } : {}}
                      />
                    ))}
                  </ScrollView>
                </Menu>

                {budgetCurrency !== newTripData.defaultCurrency && (
                  <View style={styles.conversionNote}>
                    <Text style={styles.conversionText}>
                      💱 O orçamento será convertido de {budgetCurrency} para {newTripData.defaultCurrency}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />
                
                <View style={styles.dateSection}>
                  <Text style={styles.sectionTitle}>📅 Período da Viagem</Text>
                  <Text style={styles.dateHelp}>Toque nos botões abaixo para selecionar as datas</Text>
                  
                  <View style={styles.dateRow}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        console.log('Start date button pressed');
                        if (Platform.OS === 'android') {
                          openAndroidStartPicker();
                        } else {
                          setShowStartDatePicker(true);
                        }
                      }}
                      style={styles.dateButton}
                      icon="calendar"
                    >
                      Início: {formatDate(newTripData.startDate)}
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => {
                        console.log('End date button pressed');
                        if (Platform.OS === 'android') {
                          openAndroidEndPicker();
                        } else {
                          setShowEndDatePicker(true);
                        }
                      }}
                      style={styles.dateButton}
                      icon="calendar"
                    >
                      Fim: {formatDate(newTripData.endDate)}
                    </Button>
                  </View>
                  
                  <View style={styles.durationInfo}>
                    <Text style={styles.durationText}>
                      ⏱️ Duração: {calculateTripDuration(newTripData.startDate, newTripData.endDate)} dia(s)
                    </Text>
                  </View>
                  
                  {(showStartDatePicker || showEndDatePicker) && (
                    <Text style={styles.pickerNote}>
                      {Platform.OS === 'android' 
                        ? '📱 Selecione a data e toque em OK' 
                        : '📱 Selecione a data na roda acima'}
                    </Text>
                  )}
                </View>

                {Platform.OS === 'ios' && showStartDatePicker && (
                  <DateTimePicker
                    value={newTripData.startDate}
                    mode="date"
                    display={'spinner'}
                    onChange={handleStartDateChange}
                  />
                )}

                {Platform.OS === 'ios' && showEndDatePicker && (
                  <DateTimePicker
                    value={newTripData.endDate}
                    mode="date"
                    display={'spinner'}
                    onChange={handleEndDateChange}
                    minimumDate={newTripData.startDate}
                  />
                )}
                
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
            <Button onPress={() => {
              setShowCreateDialog(false);
              setShowCurrencyMenu(false);
              setShowBudgetCurrencyMenu(false);
              setBudgetCurrency('USD');
            }}>Cancelar</Button>
            <Button mode="contained" onPress={handleCreateTrip}>Criar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  tripCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  activeTrip: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    flex: 1,
    fontSize: 18,
  },
  activeChip: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tripBudget: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  tripDuration: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    fontWeight: '500',
    color: '#4CAF50',
  },
  tripDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabSecondary: {
    position: 'absolute',
    right: 16,
  },
  bottomSpacer: {
    height: 80,
  },
  input: {
    marginBottom: 12,
  },
  currencyButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  currencyButtonContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 16,
  },
  dateSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  conversionNote: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  conversionText: {
    fontSize: 14,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    justifyContent: 'center',
  },
  durationInfo: {
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
  },
  dateHelp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  pickerNote: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  dialog: {
    maxHeight: Math.round(Dimensions.get('window').height * 0.85),
  },
  dialogScrollContent: {
    paddingBottom: 24,
  },
});

export default TripListScreen;
