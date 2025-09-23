import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
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
  Portal,
  ActivityIndicator
} from 'react-native-paper';
import { useMedicationContext } from '../contexts/MedicationContext';
import { getRelativeTime, formatDate, formatTime } from '../utils/dateUtils';

const MedicationListScreen = ({ navigation }) => {
  const theme = useTheme();
  const { 
    medications, 
    loading, 
    takeMedication, // Assuming this will be added
    deleteMedication, // Assuming this will be added
  } = useMedicationContext();
  
  const [dialog, setDialog] = useState({ visible: false, item: null, action: null });

  const showConfirmationDialog = (item, action) => {
    setDialog({ visible: true, item, action });
  };

  const handleConfirm = async () => {
    const { item, action } = dialog;
    if (!item || !action) return;

    try {
      if (action === 'delete' && deleteMedication) {
        await deleteMedication(item.id);
      } else if (action === 'take' && takeMedication) {
        await takeMedication(item);
      }
    } catch (e) {
      Alert.alert('Erro', `Não foi possível ${action === 'delete' ? 'excluir' : 'confirmar a dose do'} medicamento.`);
      console.error(e);
    }
    
    setDialog({ visible: false, item: null, action: null });
  };

  const MedicationCard = ({ item }) => {
    const nextAlarmDate = item.nextAlarm?.toDate ? item.nextAlarm.toDate() : null;
    const isOverdue = nextAlarmDate && nextAlarmDate < new Date();

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>{item.name}</Title>
            <View style={styles.actions}>
              <IconButton
                icon="check"
                mode="contained"
                size={20}
                onPress={() => showConfirmationDialog(item, 'take')}
                iconColor={theme.colors.onPrimary}
                style={{ backgroundColor: theme.colors.primary }}
                disabled={!item.isActive}
              />
              <IconButton
                icon="delete-outline"
                onPress={() => showConfirmationDialog(item, 'delete')}
                size={24}
              />
            </View>
          </View>
          <Paragraph style={styles.dosage}>{item.dosage}</Paragraph>
          
          <View style={styles.infoRow}>
            <Chip icon="clock-outline" selected={!item.isActive}>
              {item.isActive ? `A cada ${item.frequency} horas` : 'Pausado'}
            </Chip>
            {item.lastTaken && (
              <Chip icon="history">{`Última dose: ${getRelativeTime(item.lastTaken)}`}</Chip>
            )}
          </View>

          {item.isActive && nextAlarmDate && (
            <View style={[styles.nextDose, isOverdue && { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={styles.nextDoseLabel}>Próxima dose:</Text>
              <Text style={[styles.nextDoseValue, isOverdue && { color: theme.colors.error }]}>
                {`${formatDate(nextAlarmDate)}, ${formatTime(nextAlarmDate)} (${getRelativeTime(nextAlarmDate)})`}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {medications.length > 0 ? (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MedicationCard item={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title style={styles.emptyTitle}>💊 Nenhum Medicamento</Title>
              <Paragraph style={styles.emptyText}>
                Adicione seus medicamentos para receber lembretes.
              </Paragraph>
            </Card.Content>
          </Card>
        </View>
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        label="Novo Medicamento"
        onPress={() => navigation.navigate('AddMedication')}
      />

      <Portal>
        <Dialog visible={dialog.visible} onDismiss={() => setDialog({ visible: false, item: null, action: null })}>
          <Dialog.Title>
            {dialog.action === 'delete' ? 'Excluir Medicamento' : 'Confirmar Dose'}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {dialog.action === 'delete'
                ? `Tem certeza que deseja excluir "${dialog.item?.name}"? Esta ação não pode ser desfeita.`
                : `Você confirma que tomou uma dose de "${dialog.item?.name}" agora?`}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog({ visible: false, item: null, action: null })}>Cancelar</Button>
            <Button 
              onPress={handleConfirm} 
              mode="contained" 
              buttonColor={dialog.action === 'delete' ? theme.colors.error : theme.colors.primary}
            >
              {dialog.action === 'delete' ? 'Excluir' : 'Confirmar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 8, paddingBottom: 80 },
  card: { margin: 8, borderRadius: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  dosage: { opacity: 0.8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  nextDose: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  nextDoseLabel: { fontSize: 12, opacity: 0.7 },
  nextDoseValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyCard: { borderRadius: 16, width: '100%' },
  emptyContent: { padding: 20, alignItems: 'center' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { textAlign: 'center', opacity: 0.7 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 16 },
});

export default MedicationListScreen;
