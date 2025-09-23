import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
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
  Portal,
  Dialog,
  useTheme
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const AddRecurringTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { categories, addRecurringTransaction, trips } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, convertCurrency } = useCurrencyContext();
  const theme = useTheme();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  
  // Recurring transaction specific states
  const [frequency, setFrequency] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFrequencyDialog, setShowFrequencyDialog] = useState(false);

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
      
      // Set trip's default currency
      if (currentTrip?.defaultCurrency) {
        setSelectedCurrency(currentTrip.defaultCurrency);
      }
      // Do NOT force end date to trip end; let user choose freely
    }
  }, [tripId, trips]);

  // Calculate converted amount when amount or currency changes
  useEffect(() => {
    const calculateConversion = async () => {
      if (amount && selectedCurrency && trip?.defaultCurrency && selectedCurrency !== trip.defaultCurrency) {
        try {
          const numAmount = parseFloat(amount.replace(',', '.'));
          if (!isNaN(numAmount) && numAmount > 0) {
            const converted = await convertCurrency(numAmount, selectedCurrency, trip.defaultCurrency);
            setConvertedAmount(converted);
          } else {
            setConvertedAmount(null);
          }
        } catch (error) {
          console.error('Error converting currency:', error);
          setConvertedAmount(null);
        }
      } else {
        setConvertedAmount(null);
      }
    };

    calculateConversion();
  }, [amount, selectedCurrency, trip?.defaultCurrency, convertCurrency]);

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'biannual', label: 'Semestral' }
  ];

  // Opções de categorias para RECEITAS (chips)
  const incomeCategoryOptions = [
    'Salário',
    'Reembolso',
    'Freelance',
    'Juros',
    'Investimentos',
    'Outros'
  ];

  // Limpar seleção de categoria ao alternar tipo
  useEffect(() => {
    if (type === 'income') {
      setSelectedCategoryId('');
    } else {
      setSelectedCategoryName('');
    }
  }, [type]);

  const handleStartDateChange = (event, selectedDate) => {
    // iOS inline picker callback
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    // iOS inline picker callback
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const openAndroidStartPicker = () => {
    DateTimePickerAndroid.open({
      value: startDate || new Date(),
      mode: 'date',
      onChange: (evt, date) => {
        if (evt?.type !== 'dismissed' && date) {
          setStartDate(date);
          if (endDate && date > endDate) setEndDate(null);
        }
      },
    });
  };

  const openAndroidEndPicker = () => {
    DateTimePickerAndroid.open({
      value: endDate || (startDate || new Date()),
      mode: 'date',
      onChange: (evt, date) => {
        if (evt?.type !== 'dismissed' && date) {
          if (date >= startDate) setEndDate(date);
        }
      },
      minimumDate: startDate,
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Selecionar';
    return date.toLocaleDateString('pt-BR');
  };

  const calculateTotalOccurrences = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    switch (frequency) {
      case 'daily':
        return diffDays + 1;
      case 'weekly':
        return Math.floor(diffDays / 7) + 1;
      case 'monthly':
        return Math.floor(diffDays / 30) + 1;
      case 'quarterly':
        return Math.floor(diffDays / 90) + 1;
      case 'biannual':
        return Math.floor(diffDays / 180) + 1;
      default:
        return 0;
    }
  };

  const calculateTotalAmount = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount)) return 0;
    return numAmount * calculateTotalOccurrences();
  };

  const setStartDateToToday = () => setStartDate(new Date());
  const setEndDateToTripEnd = () => {
    if (trip?.endDate) setEndDate(trip.endDate?.toDate?.() || trip.endDate);
  };

  const handleSubmit = async () => {
    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      setSnackbarMessage('Por favor, insira um valor válido maior que zero');
      setShowSnackbar(true);
      return;
    }
    if (!tripId) {
      setSnackbarMessage('Erro: ID da viagem não encontrado');
      setShowSnackbar(true);
      return;
    }
    if (!endDate) {
      setSnackbarMessage('Por favor, selecione uma data final');
      setShowSnackbar(true);
      return;
    }
    if (endDate <= startDate) {
      setSnackbarMessage('A data final deve ser posterior à data inicial');
      setShowSnackbar(true);
      return;
    }

    // Resolve category fields
    let categoryId = null;
    let categoryName = '';
    if (type === 'income') {
      categoryId = null;
      categoryName = selectedCategoryName || 'Receita não informada';
    } else {
      categoryId = selectedCategoryId || null;
      if (categoryId) {
        const cat = categories?.find(c => c.id === categoryId);
        categoryName = cat?.name || 'Gasto não informado';
      } else {
        categoryName = 'Gasto não informado';
      }
    }

    setLoading(true);

    try {
      // Calcular valor na moeda da viagem para projeção
      let amountInTripCurrency = numericAmount;
      const tripCurrency = trip?.defaultCurrency || 'USD';
      if (selectedCurrency && tripCurrency && selectedCurrency !== tripCurrency) {
        try {
          amountInTripCurrency = await convertCurrency(numericAmount, selectedCurrency, tripCurrency);
        } catch (e) {
          console.warn('Falha ao converter para moeda da viagem, usando valor original para projeção.');
          amountInTripCurrency = numericAmount;
        }
      }

      const recurringTransactionData = {
        tripId,
        // Guardamos o valor original e moeda original para exibição e para a transação efetiva ao confirmar
        amount: numericAmount,
        currency: selectedCurrency,
        // E também o valor convertido para a moeda da viagem para cálculo do saldo projetado
        amountInTripCurrency,
        tripCurrency,
        description: description?.trim?.() || '',
        type,
        categoryId,
        categoryName,
        frequency,
        startDate,
        endDate,
        isRecurring: true,
        totalOccurrences: calculateTotalOccurrences(),
        totalAmount: numericAmount * calculateTotalOccurrences(),
        createdAt: new Date(),
      };

      await addRecurringTransaction(recurringTransactionData);
      setSnackbarMessage('Transação recorrente adicionada com sucesso!');
      setShowSnackbar(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      console.error('Erro ao adicionar transação recorrente:', error);
      setSnackbarMessage('Erro ao adicionar transação recorrente. Tente novamente.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>🔄 Nova Transação Recorrente</Title>
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

            {convertedAmount && (
              <Chip icon="swap-horizontal" style={styles.conversionChip}>
                ≈ {formatCurrencyValue(convertedAmount, trip?.defaultCurrency || 'USD')}
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

            <Text style={styles.sectionTitle}>Frequência</Text>
            <Button mode="outlined" onPress={() => setShowFrequencyDialog(true)} style={styles.frequencyButton} icon="calendar-sync">
              {frequencyOptions.find(f => f.value === frequency)?.label}
            </Button>
            
            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Período</Text>
            <View style={styles.dateSection}>
              <View style={styles.dateRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => Platform.OS === 'android' ? openAndroidStartPicker() : setShowStartDatePicker(true)}
                  style={styles.dateButton}
                  icon="calendar-start"
                >
                  Início: {formatDate(startDate)}
                </Button>
                <Button 
                  mode="text" 
                  onPress={setStartDateToToday}
                  style={styles.shortcutButton}
                >
                  Hoje
                </Button>
              </View>
              
              <View style={styles.dateRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => Platform.OS === 'android' ? openAndroidEndPicker() : setShowEndDatePicker(true)}
                  style={styles.dateButton}
                  icon="calendar-end"
                >
                  Fim: {formatDate(endDate)}
                </Button>
                <Button 
                  mode="text" 
                  onPress={setEndDateToTripEnd}
                  style={styles.shortcutButton}
                  disabled={!trip?.endDate}
                >
                  Fim da viagem
                </Button>
              </View>
            </View>

            {Platform.OS === 'ios' && showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
              />
            )}
            {Platform.OS === 'ios' && showEndDatePicker && (
              <DateTimePicker
                value={endDate || startDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                minimumDate={startDate}
              />
            )}

            {startDate && endDate && amount && (
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Title style={styles.summaryTitle}>📊 Resumo</Title>
                  <Text style={styles.summaryText}>
                    • Frequência: {frequencyOptions.find(f => f.value === frequency)?.label}
                  </Text>
                  <Text style={styles.summaryText}>
                    • Ocorrências: {calculateTotalOccurrences()}x
                  </Text>
                  <Text style={styles.summaryText}>
                    • Valor total: {(() => {
                      const numAmount = parseFloat(amount.replace(',', '.'));
                      const occ = calculateTotalOccurrences();
                      const tripCurrency = trip?.defaultCurrency || selectedCurrency;
                      if (!isNaN(numAmount) && tripCurrency && selectedCurrency && selectedCurrency !== tripCurrency) {
                        return `${formatCurrencyValue(numAmount * occ, selectedCurrency)}  (≈ ${formatCurrencyValue((convertedAmount || numAmount) * occ, tripCurrency)})`;
                      }
                      return formatCurrencyValue(numAmount * occ, selectedCurrency);
                    })()}
                  </Text>
                  <Chip icon="information-outline" style={styles.impactChip}>
                    Impacta apenas o saldo projetado
                  </Chip>
                </Card.Content>
              </Card>
            )}

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Categoria (opcional)</Text>
            <View style={styles.chipsContainer}>
              {(type === 'income' ? incomeCategoryOptions.map(name => ({ name, id: name })) : categories).map(cat => (
                <Chip
                  key={cat.id || cat.name}
                  selected={type === 'income' ? selectedCategoryName === cat.name : selectedCategoryId === cat.id}
                  onPress={() => {
                    if (type === 'income') {
                      setSelectedCategoryName(prev => prev === cat.name ? '' : cat.name);
                    } else {
                      setSelectedCategoryId(prev => prev === cat.id ? '' : cat.id);
                    }
                  }}
                  style={[styles.categoryChip, (type === 'income' ? selectedCategoryName === cat.name : selectedCategoryId === cat.id) && styles.categoryChipSelected]}
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
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
            icon="check"
          >
            Adicionar
          </Button>
        </View>
        
        {/* Dialogs */}
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
                          setSelectedCurrency(currency.code);
                          setShowCurrencyDialog(false);
                        }}
                      />
                    )}
                    onPress={() => {
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

          <Dialog visible={showFrequencyDialog} onDismiss={() => setShowFrequencyDialog(false)}>
            <Dialog.Title>Selecionar Frequência</Dialog.Title>
            <Dialog.ScrollArea>
              <ScrollView style={{ maxHeight: 320 }}>
                {frequencyOptions.map(opt => (
                  <List.Item
                    key={opt.value}
                    title={opt.label}
                    onPress={() => { setFrequency(opt.value); setShowFrequencyDialog(false); }}
                    right={() => (
                      <RadioButton
                        value={opt.value}
                        status={frequency === opt.value ? 'checked' : 'unchecked'}
                        onPress={() => { setFrequency(opt.value); setShowFrequencyDialog(false); }}
                      />
                    )}
                  />
                ))}
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={() => setShowFrequencyDialog(false)}>Fechar</Button>
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
  container: { flex: 1 },
  scrollView: { flex: 1, paddingTop: 8 },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  tripChip: { alignSelf: 'flex-start', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { marginBottom: 12 },
  currencyButton: { alignSelf: 'flex-start', marginBottom: 8 },
  conversionChip: { alignSelf: 'flex-start', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { flex: 1, paddingVertical: 4 },
  typeChipSelected: { backgroundColor: '#E3F2FD' },
  frequencyButton: { alignSelf: 'flex-start' },
  dateSection: { marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateButton: { flex: 1, marginRight: 8 },
  shortcutButton: { paddingHorizontal: 8 },
  summaryCard: { backgroundColor: '#f5f5f5', marginVertical: 16, borderRadius: 12 },
  summaryTitle: { fontSize: 18, marginBottom: 8 },
  summaryText: { fontSize: 14, marginBottom: 4, opacity: 0.8 },
  impactChip: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#FFF8E1' },
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
  divider: { marginVertical: 20 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  categoryChip: { marginRight: 6, marginBottom: 6 },
  categoryChipSelected: { backgroundColor: '#E3F2FD' },
});

export default AddRecurringTransactionScreen;
