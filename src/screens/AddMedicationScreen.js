import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  RadioButton, 
  Chip,
  Snackbar
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { createMedication } from '../services/firebase';

const AddMedicationScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(8); // horas
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const frequencyOptions = [
    { label: 'A cada 4 horas', value: 4 },
    { label: 'A cada 6 horas', value: 6 },
    { label: 'A cada 8 horas', value: 8 },
    { label: 'A cada 12 horas', value: 12 },
    { label: 'Uma vez ao dia', value: 24 },
  ];

  const handleSubmit = async () => {
    if (!name || !dosage || !duration) {
      setShowSnackbar(true);
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      await createMedication(userId, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        duration: parseInt(duration),
        notes: notes.trim(),
        startDate: new Date(),
        isActive: true,
        createdAt: new Date()
      });

      Alert.alert('Sucesso', 'Medicamento adicionado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao adicionar medicamento:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>💊 Novo Medicamento</Title>
          
          <TextInput
            label="💊 Nome do Medicamento"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="📏 Dosagem (ex: 500mg)"
            value={dosage}
            onChangeText={setDosage}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.section}>
            <Paragraph>Frequência:</Paragraph>
            <RadioButton.Group 
              onValueChange={value => setFrequency(value)} 
              value={frequency}
            >
              {frequencyOptions.map((option) => (
                <RadioButton.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RadioButton.Group>
          </View>

          <TextInput
            label="📅 Duração (dias)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="📝 Observações (opcional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.infoSection}>
            <Paragraph style={styles.infoText}>
              ℹ️ O primeiro lembrete será enviado imediatamente após cadastrar o medicamento.
            </Paragraph>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            icon="plus"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Adicionar Medicamento'}
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        Por favor, preencha todos os campos obrigatórios
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  section: {
    marginVertical: 16,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
  },
});

export default AddMedicationScreen;
