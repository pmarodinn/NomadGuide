import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
  Divider
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';

const TripListScreen = ({ navigation }) => {
  const { trips, activeTrip, loading, createTrip, updateTrip, activateTrip } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, detectCurrencyByCountry } = useCurrencyContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: '',
    budget: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    description: '',
    defaultCurrency: 'USD'
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
      // Criar nova viagem (o contexto já gerencia userId e ativação)
      await createTrip({
        name: newTripData.name.trim(),
        budget: budget,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate,
        description: newTripData.description.trim(),
        defaultCurrency: newTripData.defaultCurrency,
        isActive: true,
        createdAt: new Date()
      });

      setShowCreateDialog(false);
      setNewTripData({
        name: '',
        budget: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: '',
        defaultCurrency: 'USD'
      });

      Alert.alert('Sucesso', 'Viagem criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      Alert.alert('Erro', 'Não foi possível criar a viagem');
    }
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

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Viagem"
        onPress={() => setShowCreateDialog(true)}
      />

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>✈️ Nova Viagem</Dialog.Title>
          <Dialog.Content>
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
            
            <TextInput
              label="Descrição (opcional)"
              value={newTripData.description}
              onChangeText={(text) => setNewTripData(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancelar</Button>
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
});

export default TripListScreen;
