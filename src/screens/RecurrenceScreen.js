import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  Text, 
  useTheme, 
  FAB, 
  Chip, 
  IconButton,
  Button,
  Dialog,
  Portal
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { formatDate } from '../utils/dateUtils';

const RecurrenceScreen = ({ navigation }) => {
  const theme = useTheme();
  const { 
    recurringTransactions, 
    getActiveTrip, 
    deleteRecurringTransaction // Assuming this will be added to context
  } = useTripContext();
  const { formatCurrency: formatCurrencyValue } = useCurrencyContext();
  
  const [dialog, setDialog] = useState({ visible: false, item: null });

  const activeTrip = getActiveTrip();
  const activeRecurrences = activeTrip 
    ? recurringTransactions.filter(r => r.tripId === activeTrip.id)
    : [];

  const frequencyMap = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    biannual: 'Semestral',
  };

  const handleDelete = (item) => {
    setDialog({ visible: true, item });
  };

  const confirmDelete = async () => {
    if (dialog.item && deleteRecurringTransaction) {
      try {
        await deleteRecurringTransaction(dialog.item.id);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível excluir a recorrência.');
      }
    }
    setDialog({ visible: false, item: null });
  };

  const RecurrenceCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>{item.description || 'Recorrência sem descrição'}</Title>
          <IconButton
            icon="delete-outline"
            onPress={() => handleDelete(item)}
            size={24}
          />
        </View>
        <View style={styles.row}>
          <Text style={[
            styles.amount, 
            { color: item.type === 'income' ? theme.colors.primary : theme.colors.error }
          ]}>
            {item.type === 'income' ? '+' : '-'} {formatCurrencyValue(item.amount, item.currency)}
          </Text>
          <Chip icon="sync" style={styles.chip}>{frequencyMap[item.frequency] || item.frequency}</Chip>
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <Chip icon="calendar-start">{`Início: ${formatDate(item.startDate)}`}</Chip>
          <Chip icon="calendar-end">{`Fim: ${formatDate(item.endDate)}`}</Chip>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {activeRecurrences.length > 0 ? (
          activeRecurrences.map(item => <RecurrenceCard key={item.id} item={item} />)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>💸 Nenhuma Recorrência</Title>
              <Paragraph style={styles.emptyText}>
                Crie transações recorrentes para automatizar seus lançamentos.
              </Paragraph>
            </Card.Content>
          </Card>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        label="Nova Recorrência"
        onPress={() => activeTrip ? navigation.navigate('AddRecurringTransaction', { tripId: activeTrip.id }) : Alert.alert('Nenhuma viagem ativa', 'Ative uma viagem para adicionar recorrências.')}
      />

      <Portal>
        <Dialog visible={dialog.visible} onDismiss={() => setDialog({ visible: false, item: null })}>
          <Dialog.Title>Excluir Recorrência</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Tem certeza que deseja excluir a recorrência "{dialog.item?.description}"? Esta ação não pode ser desfeita.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog({ visible: false, item: null })}>Cancelar</Button>
            <Button onPress={confirmDelete} mode="contained" buttonColor={theme.colors.error}>Excluir</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  chip: {
    backgroundColor: '#f0f0f0',
  },
  emptyCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 2,
  },
  emptyContent: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

export default RecurrenceScreen;
