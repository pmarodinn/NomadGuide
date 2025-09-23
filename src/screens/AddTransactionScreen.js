import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Menu,
  Portal,
  Dialog
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const AddTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { categories, addTransaction, trips } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, convertCurrency } = useCurrencyContext();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencyInitialized, setCurrencyInitialized] = useState(false);
  const userChangedCurrencyRef = useRef(false);

  const incomeCategories = [
    { key: 'salary', name: 'Salário', icon: '💼' },
    { key: 'allowance', name: 'Mesada', icon: '👪' },
    { key: 'scholarship', name: 'Bolsa', icon: '🎓' },
    { key: 'government_aid', name: 'Auxílio do Governo', icon: '🏛️' },
    { key: 'freelance', name: 'Freelance', icon: '🧑‍💻' },
    { key: 'investment', name: 'Investimentos', icon: '📈' },
    { key: 'rental', name: 'Aluguel', icon: '🏠' },
    { key: 'gifts', name: 'Presentes', icon: '🎁' },
    { key: 'refund', name: 'Reembolso', icon: '↩️' },
    { key: 'other_income', name: 'Outros', icon: '🗂️' },
  ];

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
      // Initialize currency only once, unless user changes it manually
      if (currentTrip?.defaultCurrency && !currencyInitialized && !userChangedCurrencyRef.current) {
        setSelectedCurrency(currentTrip.defaultCurrency);
        setCurrencyInitialized(true);
      }
    }
  }, [tripId, trips, currencyInitialized]);

  // Reset category selections when type changes
  useEffect(() => {
    setSelectedCategoryId('');
    setSelectedIncomeCategory('');
  }, [type]);

  // Calculate converted amount when amount or currency changes (with race guard)
  useEffect(() => {
    let cancelled = false;
    const calculateConversion = async () => {
      if (amount && selectedCurrency && trip?.defaultCurrency && selectedCurrency !== trip.defaultCurrency) {
        try {
          const numAmount = parseFloat(amount.replace(',', '.'));
          if (!isNaN(numAmount) && numAmount > 0) {
            const converted = await convertCurrency(numAmount, selectedCurrency, trip.defaultCurrency);
            if (!cancelled) setConvertedAmount(converted);
          } else {
            if (!cancelled) setConvertedAmount(null);
          }
        } catch (error) {
          console.error('Error converting currency:', error);
          if (!cancelled) setConvertedAmount(null);
        }
      } else {
        if (!cancelled) setConvertedAmount(null);
      }
    };

    calculateConversion();
    return () => { cancelled = true; };
  }, [amount, selectedCurrency, trip?.defaultCurrency, convertCurrency]);

  const handleSubmit = async () => {
    // Validation
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setSnackbarMessage('Por favor, insira um valor válido maior que zero');
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
      const isExpense = type === 'expense';
      const transactionData = {
        tripId,
        amount: parseFloat(amount),
        description: description?.trim?.() || '',
        type,
        categoryId: isExpense ? (selectedCategoryId || null) : null,
        categoryName: isExpense
          ? (selectedCategoryId ? undefined : 'Gasto não informado')
          : (selectedIncomeCategory || 'Receita não informada'),
        currency: selectedCurrency,
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
            label="💰 Valor"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            placeholder="0,00"
            right={
              amount ? (
                <TextInput.Affix 
                  text={formatCurrencyValue(parseFloat(amount) || 0, selectedCurrency)} 
                />
              ) : null
            }
          />

          <View style={styles.currencyContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowCurrencyDialog(true)}
              style={styles.currencyButton}
              contentStyle={styles.currencyButtonContent}
              icon="currency-usd"
            >
              {(() => {
                const currency = getSupportedCurrencies().find(c => c.code === selectedCurrency);
                return `${currency?.flag || ''} ${currency?.code || 'USD'}`;
              })()}
            </Button>
            
            {convertedAmount && trip?.defaultCurrency && selectedCurrency !== trip.defaultCurrency && (
              <View style={styles.conversionInfo}>
                <Text style={styles.conversionText}>
                  ≈ {formatCurrencyValue(convertedAmount, trip.defaultCurrency)} 
                  <Text style={styles.conversionNote}> (moeda da viagem)</Text>
                </Text>
              </View>
            )}
          </View>

      {/* Currency selection dialog */}
      <Portal>
        <Dialog visible={showCurrencyDialog} onDismiss={() => setShowCurrencyDialog(false)}>
          <Dialog.Title>Selecionar Moeda</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 320 }}>
              {getSupportedCurrencies().map((currency) => (
                <List.Item
                  key={currency.code}
                  title={`${currency.flag} ${currency.code} - ${currency.name}`}
                  right={() => (
                    <RadioButton
                      value={currency.code}
                      status={selectedCurrency === currency.code ? 'checked' : 'unchecked'}
                      onPress={() => {
                        userChangedCurrencyRef.current = true;
                        setSelectedCurrency(currency.code);
                        setShowCurrencyDialog(false);
                      }}
                    />
                  )}
                  onPress={() => {
                    userChangedCurrencyRef.current = true;
                    setSelectedCurrency(currency.code);
                    setShowCurrencyDialog(false);
                  }}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowCurrencyDialog(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

          <TextInput
            label="📝 Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Almoço no restaurante"
            multiline
            numberOfLines={2}
          />

          <View style={styles.section}>
            <Paragraph style={styles.sectionTitle}>Categoria (opcional):</Paragraph>
            {type === 'expense' ? (
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    mode={selectedCategoryId === cat.id ? 'flat' : 'outlined'}
                    selected={selectedCategoryId === cat.id}
                    onPress={() => setSelectedCategoryId(prev => prev === cat.id ? '' : cat.id)}
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
            ) : (
              <View style={styles.categoryGrid}>
                {incomeCategories.map((cat) => (
                  <Chip
                    key={cat.key}
                    mode={selectedIncomeCategory === cat.name ? 'flat' : 'outlined'}
                    selected={selectedIncomeCategory === cat.name}
                    onPress={() => setSelectedIncomeCategory(prev => prev === cat.name ? '' : cat.name)}
                    style={[
                      styles.categoryChip,
                      selectedIncomeCategory === cat.name && styles.selectedChip
                    ]}
                    textStyle={styles.chipText}
                  >
                    {cat.icon} {cat.name}
                  </Chip>
                ))}
              </View>
            )}
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
  currencyContainer: {
    marginVertical: 8,
  },
  currencyButton: {
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  currencyButtonContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  conversionInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  conversionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  conversionNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default AddTransactionScreen;
