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
  Dialog
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const AddRecurringTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { categories, addRecurringTransaction, trips } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, convertCurrency } = useCurrencyContext();
  
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
      const recurringTransactionData = {
        tripId,
        amount: numericAmount,
        description: description?.trim?.() || '',
        type,
        categoryId,
        categoryName,
        currency: selectedCurrency,
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>🔄 Nova Transação Recorrente</Title>
          {trip && (
            <Paragraph style={styles.tripInfo}>📍 Viagem: {trip.name}</Paragraph>
          )}

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Tipo de Transação</Text>
          <View style={styles.typeRow}>
            <Chip
              selected={type === 'expense'}
              onPress={() => setType('expense')}
              style={[styles.typeChip, type === 'expense' && styles.typeChipSelected]}
            >
              💸 Gasto
            </Chip>
            <Chip
              selected={type === 'income'}
              onPress={() => setType('income')}
              style={[styles.typeChip, type === 'income' && styles.typeChipSelected]}
            >
              💰 Receita
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="Valor"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          {/* Currency selection via Dialog (stable) */}
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
          </Portal>

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
            multiline
          />

          <Divider style={styles.divider} />

          {/* Frequency selection via Dialog to avoid overflow */}
          <Text style={styles.sectionTitle}>Frequência</Text>
          <Button mode="outlined" onPress={() => setShowFrequencyDialog(true)} style={styles.frequencyButton} icon="calendar-sync">
            {frequencyOptions.find(f => f.value === frequency)?.label}
          </Button>
          <Portal>
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

          <Divider style={styles.divider} />

          {/* Date Selection */}
          <Text style={styles.sectionTitle}>Período</Text>
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <Button 
                mode="outlined" 
                onPress={() => Platform.OS === 'android' ? openAndroidStartPicker() : setShowStartDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
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
                icon="calendar"
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

          {/* iOS inline pickers */}
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

          {/* Summary */}
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
                  • Valor total: {formatCurrencyValue(calculateTotalAmount(), selectedCurrency)}
                </Text>
                <Text style={styles.impactText}>
                  ⚠️ Impacta apenas o saldo projetado
                </Text>
              </Card.Content>
            </Card>
          )}

          <Divider style={styles.divider} />

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>Categoria (opcional)</Text>
          {type === 'income' ? (
            <View style={styles.chipsContainer}>
              {incomeCategoryOptions.map(name => (
                <Chip
                  key={name}
                  selected={selectedCategoryName === name}
                  onPress={() => setSelectedCategoryName(prev => prev === name ? '' : name)}
                  style={[styles.categoryChip, selectedCategoryName === name && styles.categoryChipSelected]}
                >
                  {name}
                </Chip>
              ))}
            </View>
          ) : (
            categories && categories.map((category) => (
              <List.Item
                key={category.id}
                title={`${category.icon} ${category.name}`}
                onPress={() => setSelectedCategoryId(prev => prev === category.id ? '' : category.id)}
                left={() => (
                  <RadioButton
                    value={category.id}
                    status={selectedCategoryId === category.id ? 'checked' : 'unchecked'}
                  />
                )}
              />
            ))
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            icon="check"
          >
            Adicionar Transação Recorrente
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16, elevation: 4 },
  tripInfo: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#2196F3' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  input: { marginBottom: 16 },
  currencyButton: { marginBottom: 12, alignSelf: 'flex-start' },
  conversionChip: { alignSelf: 'flex-start', marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { marginBottom: 8 },
  typeChipSelected: { backgroundColor: '#E3F2FD' },
  frequencyButton: { alignSelf: 'flex-start' },
  dateSection: { marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateButton: { flex: 1, marginRight: 8 },
  shortcutButton: { paddingHorizontal: 8 },
  summaryCard: { backgroundColor: '#E3F2FD', marginVertical: 16 },
  summaryTitle: { fontSize: 18, marginBottom: 8 },
  summaryText: { fontSize: 14, marginBottom: 4 },
  impactText: { fontSize: 12, fontStyle: 'italic', color: '#FF9800', marginTop: 8 },
  submitButton: { marginTop: 24, paddingVertical: 8 },
  divider: { marginVertical: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  categoryChip: { marginRight: 6, marginBottom: 6 },
  categoryChipSelected: { backgroundColor: '#E3F2FD' },
});

export default AddRecurringTransactionScreen;
