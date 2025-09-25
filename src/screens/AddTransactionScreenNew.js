import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView, StatusBar } from 'react-native';
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
  IconButton,
  Surface
} from 'react-native-paper';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { colors, spacing, borderRadius, typography, elevation } from '../theme/colors';
import { CardContainer } from '../components/BankingComponents';

const AddTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const { categories, addTransaction, trips } = useTripContext();
  const { getSupportedCurrencies, formatCurrency: formatCurrencyValue, convertCurrency } = useCurrencyContext();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);

  useEffect(() => {
    if (tripId && trips) {
      const currentTrip = trips.find(t => t.id === tripId);
      setTrip(currentTrip);
      
      if (currentTrip?.defaultCurrency) {
        setSelectedCurrency(currentTrip.defaultCurrency);
      }
    }
  }, [tripId, trips]);

  // When switching type, clear category selections
  useEffect(() => {
    setSelectedCategoryId('');
    setSelectedCategoryName('');
  }, [type]);

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

  const incomeCategoryOptions = [
    'Salário',
    'Mesada',
    'Bolsa',
    'Auxílio do Governo',
    'Freelance',
    'Investimentos',
    'Aluguel',
    'Presentes',
    'Reembolso',
    'Outros',
  ];

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateChange = (event, selectedDate) => {
    const isAndroid = Platform.OS === 'android';
    
    if (isAndroid) {
      setShowDatePicker(false);
    }
    
    if (selectedDate && event?.type !== 'dismissed') {
      setDate(selectedDate);
    }
    
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const openAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      onChange: handleDateChange,
      maximumDate: new Date(),
    });
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
      const transactionData = {
        tripId,
        amount: numericAmount,
        description: description?.trim?.() || '',
        type,
        categoryId,
        categoryName,
        currency: selectedCurrency,
        date,
        createdAt: new Date(),
      };

      await addTransaction(transactionData);
      setSnackbarMessage('Transação adicionada com sucesso!');
      setShowSnackbar(true);
      
      // Reset form
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      setSnackbarMessage('Erro ao adicionar transação. Tente novamente.');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <Surface style={styles.headerSurface}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={colors.backgroundSecondary}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Nova Transação</Text>
            {trip && <Text style={styles.headerSubtitle}>{trip.name}</Text>}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </Surface>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transaction Type */}
        <CardContainer style={styles.sectionCard}>
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
        </CardContainer>

        {/* Amount and Currency */}
        <CardContainer style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Valor</Text>
          <TextInput
            label="Valor"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
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
            <View style={styles.conversionContainer}>
              <Chip icon="swap-horizontal" style={styles.conversionChip}>
                ≈ {formatCurrencyValue(convertedAmount, trip?.defaultCurrency || 'USD')}
              </Chip>
            </View>
          )}
        </CardContainer>

        {/* Description and Date */}
        <CardContainer style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <TextInput
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="text" />}
            multiline
          />

          <Button 
            mode="outlined" 
            onPress={() => Platform.OS === 'android' ? openAndroidDatePicker() : setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            Data: {formatDate(date)}
          </Button>

          {Platform.OS === 'ios' && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </CardContainer>

        {/* Categories */}
        <CardContainer style={styles.sectionCard}>
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
            <View style={styles.categoriesContainer}>
              {categories && categories.map((category) => (
                <List.Item
                  key={category.id}
                  title={`${category.icon} ${category.name}`}
                  onPress={() => setSelectedCategoryId(prev => prev === category.id ? '' : category.id)}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id && styles.categoryItemSelected
                  ]}
                  left={() => (
                    <RadioButton
                      value={category.id}
                      status={selectedCategoryId === category.id ? 'checked' : 'unchecked'}
                      color={colors.primary}
                    />
                  )}
                />
              ))}
            </View>
          )}
        </CardContainer>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          icon="check"
        >
          Adicionar Transação
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Currency Dialog */}
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
                      color={colors.primary}
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
      
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  headerSurface: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...elevation.level2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headlineLarge,
    color: colors.backgroundSecondary,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.backgroundSecondary,
    opacity: 0.9,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Section Cards
  sectionCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },

  // Type Selection
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  typeChipSelected: {
    backgroundColor: colors.primaryContainer,
  },

  // Inputs
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  currencyButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.cardBorder,
  },
  dateButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.cardBorder,
  },

  // Conversion
  conversionContainer: {
    marginTop: spacing.md,
  },
  conversionChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
  },

  // Categories
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    marginBottom: spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: colors.primaryContainer,
  },
  categoriesContainer: {
    gap: spacing.xs,
  },
  categoryItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  categoryItemSelected: {
    backgroundColor: colors.primaryContainer,
  },

  // Submit
  submitButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default AddTransactionScreen;
