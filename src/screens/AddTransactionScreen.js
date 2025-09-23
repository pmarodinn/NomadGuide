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
  Dialog,
  useTheme
} from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const AddTransactionScreen = ({ navigation, route }) => {
  const { tripId, type: initialType = 'expense' } = route.params || {};
  const { categories, addTransaction, trips } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, convertCurrency } = useCurrencyContext();
  const theme = useTheme();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(initialType);
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>💰 Nova Transação</Title>
            
            {trip && (
              <Chip icon="briefcase" style={styles.tripChip}>
                Viagem: {trip.name}
              </Chip>
            )}
            
            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Tipo de Transação</Text>
            <View style={styles.typeRow}>
              <Chip
                selected={type === 'expense'}
                onPress={() => setType('expense')}
                style={[styles.typeChip, type === 'expense' && styles.typeChipSelected]}
                icon="minus-circle"
              >
                Gasto
              </Chip>
              <Chip
                selected={type === 'income'}
                onPress={() => setType('income')}
                style={[styles.typeChip, type === 'income' && styles.typeChipSelected]}
                icon="plus-circle"
              >
                Receita
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Detalhes</Text>
            <TextInput
              label="Valor"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="cash" />}
            />

            <Button
              mode="outlined"
              onPress={() => setShowCurrencyDialog(true)}
              style={styles.currencyButton}
              icon="currency-usd"
            >
              {(() => {
                const currency = getSupportedCurrencies().find(c => c.code === selectedCurrency);
                return `${currency?.flag || ''} ${currency?.code || 'USD'}`;
              })()}
            </Button>
            
            {convertedAmount && trip?.defaultCurrency && selectedCurrency !== trip.defaultCurrency && (
              <Chip icon="swap-horizontal" style={styles.conversionChip}>
                ≈ {formatCurrencyValue(convertedAmount, trip.defaultCurrency)} (na moeda da viagem)
              </Chip>
            )}

            <TextInput
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Categoria (opcional)</Text>
            <View style={styles.categoryGrid}>
              {(type === 'expense' ? categories : incomeCategories).map((cat) => (
                <Chip
                  key={cat.id || cat.key}
                  mode="outlined"
                  selected={type === 'expense' ? selectedCategoryId === cat.id : selectedIncomeCategory === cat.name}
                  onPress={() => {
                    if (type === 'expense') {
                      setSelectedCategoryId(prev => prev === cat.id ? '' : cat.id);
                    } else {
                      setSelectedIncomeCategory(prev => prev === cat.name ? '' : cat.name);
                    }
                  }}
                  style={[
                    styles.categoryChip,
                    (type === 'expense' ? selectedCategoryId === cat.id : selectedIncomeCategory === cat.name) && styles.selectedChip
                  ]}
                  textStyle={styles.chipText}
                  icon={() => <Text>{cat.icon}</Text>}
                >
                  {cat.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomActions}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.actionButton}
            icon="check"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
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

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
          style={{ bottom: 80 }}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
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
    margin: 16,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tripChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 4,
  },
  typeChipSelected: {
    backgroundColor: '#E3F2FD', // Azul claro
  },
  input: {
    marginBottom: 12,
  },
  currencyButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  conversionChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 6,
    marginBottom: 6,
  },
  selectedChip: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    marginLeft: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
  },
  divider: {
    marginVertical: 20,
  },
});

export default AddTransactionScreen;
