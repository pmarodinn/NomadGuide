import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  RadioButton, 
  List, 
  Divider,
  Snackbar,
  Text,
  Chip
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';

const AddTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { categories, addTransaction, trips } = useTripContext();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
    }
    
    // Set first category as default if available
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [tripId, trips, categories]);

  const handleSubmit = async () => {
    // Validation
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setSnackbarMessage('Por favor, insira um valor válido maior que zero');
      setShowSnackbar(true);
      return;
    }

    if (!description.trim()) {
      setSnackbarMessage('Por favor, insira uma descrição');
      setShowSnackbar(true);
      return;
    }

    if (!selectedCategoryId) {
      setSnackbarMessage('Por favor, selecione uma categoria');
      setShowSnackbar(true);
      return;
    }

    if (!tripId) {
      setSnackbarMessage('Erro: ID da viagem não encontrado');
      setShowSnackbar(true);
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        tripId,
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        categoryId: selectedCategoryId,
        date: new Date(),
      };

      await addTransaction(transactionData);
      
      // Show success message and navigate back
      setSnackbarMessage('Transação adicionada com sucesso!');
      setShowSnackbar(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      setSnackbarMessage('Erro ao adicionar transação. Tente novamente.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>💰 Nova Transação</Title>
          
          {trip && (
            <View style={styles.tripInfo}>
              <Text style={styles.tripName}>Viagem: {trip.name}</Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Paragraph style={styles.sectionTitle}>Tipo de Transação:</Paragraph>
            <RadioButton.Group 
              onValueChange={value => setType(value)} 
              value={type}
            >
              <View style={styles.radioRow}>
                <RadioButton.Item 
                  label="💸 Gasto" 
                  value="expense" 
                  status={type === 'expense' ? 'checked' : 'unchecked'}
                />
                <RadioButton.Item 
                  label="💵 Receita" 
                  value="income"
                  status={type === 'income' ? 'checked' : 'unchecked'}
                />
              </View>
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="💰 Valor (R$)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            placeholder="0,00"
            right={
              amount ? (
                <TextInput.Affix 
                  text={formatCurrency(parseFloat(amount) || 0)} 
                />
              ) : null
            }
          />

          <TextInput
            label="📝 Descrição"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Almoço no restaurante"
            multiline
            numberOfLines={2}
          />

          <View style={styles.section}>
            <Paragraph style={styles.sectionTitle}>Categoria:</Paragraph>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  mode={selectedCategoryId === cat.id ? 'flat' : 'outlined'}
                  selected={selectedCategoryId === cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  style={[
                    styles.categoryChip,
                    selectedCategoryId === cat.id && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {cat.icon} {cat.name}
                </Chip>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            icon="plus"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar Transação'}
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
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
  tripInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  input: {
    marginVertical: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    marginBottom: 8,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    fontSize: 12,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
});

export default AddTransactionScreen;
