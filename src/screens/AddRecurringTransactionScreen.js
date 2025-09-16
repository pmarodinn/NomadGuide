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
  Menu,
  SegmentedButtons
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  
  // Recurring transaction specific states
  const [frequency, setFrequency] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
      
      // Set trip's default currency
      if (currentTrip?.defaultCurrency) {
        setSelectedCurrency(currentTrip.defaultCurrency);
      }
      
      // Set default end date to trip end date
      if (currentTrip?.endDate) {
        setEndDate(currentTrip.endDate?.toDate?.() || currentTrip.endDate);
      }
    }
    
    // Set first category as default if available
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [tripId, trips, categories]);

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
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // If end date is before start date, reset it
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
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

  const setStartDateToToday = () => {
    setStartDate(new Date());
  };

  const setEndDateToTripEnd = () => {
    if (trip?.endDate) {
      setEndDate(trip.endDate?.toDate?.() || trip.endDate);
    }
  };

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

    setLoading(true);

    try {
      const recurringTransactionData = {
        tripId,
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        categoryId: selectedCategoryId,
        currency: selectedCurrency,
        frequency,
        startDate,
        endDate,
        isRecurring: true,
        totalOccurrences: calculateTotalOccurrences(),
        totalAmount: calculateTotalAmount(),
        createdAt: new Date(),
      };

      await addRecurringTransaction(recurringTransactionData);
      
      // Show success message and navigate back
      setSnackbarMessage('Transação recorrente adicionada com sucesso!');
      setShowSnackbar(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
      
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
            <Paragraph style={styles.tripInfo}>
              📍 Viagem: {trip.name}
            </Paragraph>
          )}
          
          <Divider style={styles.divider} />
          
          {/* Transaction Type */}
          <Text style={styles.sectionTitle}>Tipo de Transação</Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: 'expense', label: '💸 Gasto' },
              { value: 'income', label: '💰 Receita' }
            ]}
            style={styles.segmentedButtons}
          />
          
          <Divider style={styles.divider} />
          
          {/* Amount Input */}
          <TextInput
            label="Valor"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          
          {/* Currency Selection */}
          <Menu
            visible={showCurrencyMenu}
            onDismiss={() => setShowCurrencyMenu(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setShowCurrencyMenu(true)}
                style={styles.currencyButton}
                icon="chevron-down"
              >
                {selectedCurrency}
              </Button>
            }
          >
            {getSupportedCurrencies().map((currency) => (
              <Menu.Item
                key={currency.code}
                onPress={() => {
                  setSelectedCurrency(currency.code);
                  setShowCurrencyMenu(false);
                }}
                title={`${currency.code} - ${currency.name}`}
              />
            ))}
          </Menu>
          
          {/* Currency Conversion Info */}
          {convertedAmount && (
            <Chip icon="swap-horizontal" style={styles.conversionChip}>
              ≈ {formatCurrencyValue(convertedAmount, trip?.defaultCurrency || 'USD')}
            </Chip>
          )}
          
          {/* Description Input */}
          <TextInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
            multiline
          />
          
          <Divider style={styles.divider} />
          
          {/* Frequency Selection */}
          <Text style={styles.sectionTitle}>Frequência</Text>
          <SegmentedButtons
            value={frequency}
            onValueChange={setFrequency}
            buttons={frequencyOptions}
            style={styles.segmentedButtons}
          />
          
          <Divider style={styles.divider} />
          
          {/* Date Selection */}
          <Text style={styles.sectionTitle}>Período</Text>
          
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <Button 
                mode="outlined" 
                onPress={() => setShowStartDatePicker(true)}
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
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                Fim: {endDate ? formatDate(endDate) : 'Selecionar'}
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
          
          {/* Date Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          <Text style={styles.sectionTitle}>Categoria</Text>
          {categories && categories.map((category) => (
            <List.Item
              key={category.id}
              title={`${category.icon} ${category.name}`}
              onPress={() => setSelectedCategoryId(category.id)}
              left={() => (
                <RadioButton
                  value={category.id}
                  status={selectedCategoryId === category.id ? 'checked' : 'unchecked'}
                />
              )}
            />
          ))}
          
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  tripInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2196F3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  currencyButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  conversionChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    marginRight: 8,
  },
  shortcutButton: {
    paddingHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#FF9800',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
});

export default AddRecurringTransactionScreen;
