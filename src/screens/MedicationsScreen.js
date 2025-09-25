import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { 
  Text, 
  FAB, 
  Dialog, 
  Portal, 
  TextInput, 
  Button,
  List,
  Chip,
  Switch,
  IconButton
} from 'react-native-paper';
import { colors, spacing, borderRadius, typography, elevation } from '../theme/colors';
import { 
  BalanceCard, 
  QuickActionButton, 
  SectionHeader, 
  CardContainer 
} from '../components/BankingComponents';

const MedicationsScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: '',
    isActive: true,
    reminderEnabled: false,
  });

  // Load medications from storage (placeholder - implement with your storage solution)
  useEffect(() => {
    // TODO: Load from AsyncStorage or Firebase
    const mockMedications = [
      {
        id: '1',
        name: 'Vitamina D',
        dosage: '1000 UI',
        frequency: 'Uma vez ao dia',
        notes: 'Tomar com alimentos',
        isActive: true,
        reminderEnabled: true,
        createdAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        name: 'Ômega 3',
        dosage: '1000mg',
        frequency: 'Duas vezes ao dia',
        notes: 'Manhã e noite',
        isActive: true,
        reminderEnabled: false,
        createdAt: new Date('2025-01-02'),
      },
    ];
    setMedications(mockMedications);
  }, []);

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) {
      Alert.alert('Erro', 'Nome do medicamento é obrigatório');
      return;
    }

    const medication = {
      id: Date.now().toString(),
      ...newMedication,
      name: newMedication.name.trim(),
      createdAt: new Date(),
    };

    setMedications(prev => [medication, ...prev]);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      notes: '',
      isActive: true,
      reminderEnabled: false,
    });
    setShowAddDialog(false);
    Alert.alert('Sucesso', 'Medicamento adicionado com sucesso!');
  };

  const toggleMedicationStatus = (id) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, isActive: !med.isActive } : med
      )
    );
  };

  const toggleReminder = (id) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, reminderEnabled: !med.reminderEnabled } : med
      )
    );
  };

  const deleteMedication = (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setMedications(prev => prev.filter(med => med.id !== id));
            Alert.alert('Sucesso', 'Medicamento excluído com sucesso!');
          },
        },
      ]
    );
  };

  const MedicationCard = ({ medication }) => (
    <CardContainer style={[styles.medicationCard, !medication.isActive && styles.inactiveMedication]}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationTitle}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <View style={styles.medicationChips}>
            {medication.isActive ? (
              <Chip mode="flat" style={styles.activeChip}>Ativo</Chip>
            ) : (
              <Chip mode="flat" style={styles.inactiveChip}>Inativo</Chip>
            )}
            {medication.reminderEnabled && (
              <Chip mode="flat" style={styles.reminderChip}>🔔</Chip>
            )}
          </View>
        </View>
        <IconButton
          icon="delete"
          iconColor={colors.error}
          size={20}
          onPress={() => deleteMedication(medication.id)}
        />
      </View>

      {medication.dosage && (
        <Text style={styles.medicationDetail}>
          💊 Dosagem: {medication.dosage}
        </Text>
      )}
      
      {medication.frequency && (
        <Text style={styles.medicationDetail}>
          ⏰ Frequência: {medication.frequency}
        </Text>
      )}
      
      {medication.notes && (
        <Text style={styles.medicationNotes}>
          📝 {medication.notes}
        </Text>
      )}

      <View style={styles.medicationActions}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Ativo</Text>
          <Switch
            value={medication.isActive}
            onValueChange={() => toggleMedicationStatus(medication.id)}
            color={colors.primary}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Lembrete</Text>
          <Switch
            value={medication.reminderEnabled}
            onValueChange={() => toggleReminder(medication.id)}
            color={colors.secondary}
          />
        </View>
      </View>
    </CardContainer>
  );

  const activeMedications = medications.filter(med => med.isActive);
  const inactiveMedications = medications.filter(med => med.isActive === false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.warning} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.backgroundSecondary}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Medicamentos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <BalanceCard
          title="Total"
          balance={medications.length.toString()}
          subtitle="medicamentos"
          type="primary"
          style={styles.statCard}
        />
        <BalanceCard
          title="Ativos"
          balance={activeMedications.length.toString()}
          subtitle="em uso"
          type="success"
          style={styles.statCard}
        />
        <BalanceCard
          title="Lembretes"
          balance={medications.filter(m => m.reminderEnabled).length.toString()}
          subtitle="configurados"
          type="secondary"
          style={styles.statCard}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeMedications.length > 0 && (
          <>
            <SectionHeader title="Medicamentos Ativos" />
            {activeMedications.map(medication => (
              <MedicationCard key={medication.id} medication={medication} />
            ))}
          </>
        )}

        {inactiveMedications.length > 0 && (
          <>
            <SectionHeader title="Medicamentos Inativos" />
            {inactiveMedications.map(medication => (
              <MedicationCard key={medication.id} medication={medication} />
            ))}
          </>
        )}

        {medications.length === 0 && (
          <CardContainer style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>💊</Text>
              <Text style={styles.emptyTitle}>Nenhum Medicamento</Text>
              <Text style={styles.emptyText}>
                Adicione seus medicamentos para manter o controle dos horários e dosagens.
              </Text>
            </View>
          </CardContainer>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Medication FAB */}
      <FAB
        icon="plus"
        label="Adicionar Medicamento"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />

      {/* Add Medication Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} style={styles.dialog}>
          <Dialog.Title>💊 Novo Medicamento</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nome do Medicamento *"
              value={newMedication.name}
              onChangeText={(text) => setNewMedication(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Dosagem (opcional)"
              value={newMedication.dosage}
              onChangeText={(text) => setNewMedication(prev => ({ ...prev, dosage: text }))}
              mode="outlined"
              placeholder="Ex: 500mg, 1 comprimido"
              style={styles.input}
            />
            
            <TextInput
              label="Frequência (opcional)"
              value={newMedication.frequency}
              onChangeText={(text) => setNewMedication(prev => ({ ...prev, frequency: text }))}
              mode="outlined"
              placeholder="Ex: 2x ao dia, De 8 em 8 horas"
              style={styles.input}
            />
            
            <TextInput
              label="Observações (opcional)"
              value={newMedication.notes}
              onChangeText={(text) => setNewMedication(prev => ({ ...prev, notes: text }))}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder="Ex: Tomar com alimentos"
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Habilitar lembretes</Text>
              <Switch
                value={newMedication.reminderEnabled}
                onValueChange={(value) => setNewMedication(prev => ({ ...prev, reminderEnabled: value }))}
                color={colors.secondary}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleAddMedication}>Adicionar</Button>
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineLarge,
    color: colors.backgroundSecondary,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  medicationCard: {
    marginBottom: spacing.md,
  },
  inactiveMedication: {
    opacity: 0.6,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  medicationTitle: {
    flex: 1,
  },
  medicationName: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  medicationChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  activeChip: {
    backgroundColor: colors.successContainer,
  },
  inactiveChip: {
    backgroundColor: colors.errorContainer,
  },
  reminderChip: {
    backgroundColor: colors.secondaryContainer,
  },
  medicationDetail: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  medicationNotes: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  medicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchLabel: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },

  emptyCard: {
    alignItems: 'center',
    marginTop: spacing.xl,
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

  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.warning,
  },

  dialog: {
    backgroundColor: colors.backgroundSecondary,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },

  bottomSpacer: {
    height: spacing.xxl + 80, // Extra space for FAB
  },
});

export default MedicationsScreen;
