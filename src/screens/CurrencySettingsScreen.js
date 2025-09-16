import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  List, 
  Divider,
  Button,
  Text,
  Chip,
  Surface
} from 'react-native-paper';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const CurrencySettingsScreen = ({ navigation }) => {
  const { 
    getSupportedCurrencies, 
    formatCurrency, 
    defaultCurrency, 
    setDefaultCurrency,
    refreshExchangeRates,
    isLoadingRates,
    lastUpdated
  } = useCurrencyContext();

  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const currencies = getSupportedCurrencies();

  const handleSave = () => {
    setDefaultCurrency(selectedCurrency);
    navigation.goBack();
  };

  const handleRefreshRates = async () => {
    await refreshExchangeRates(selectedCurrency);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nunca atualizado';
    
    const now = new Date();
    const diffMinutes = Math.floor((now - lastUpdated) / 60000);
    
    if (diffMinutes < 1) return 'Há menos de 1 minuto';
    if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>⚙️ Configurações de Moeda</Title>
          <Paragraph style={styles.subtitle}>
            Configure sua moeda padrão e gerencie as taxas de câmbio
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>💱 Moeda Padrão</Title>
          <Paragraph style={styles.description}>
            Esta será a moeda principal usada nos relatórios e conversões
          </Paragraph>
          
          <View style={styles.currencyGrid}>
            {currencies.slice(0, 8).map((currency) => (
              <Chip
                key={currency.code}
                selected={selectedCurrency === currency.code}
                onPress={() => setSelectedCurrency(currency.code)}
                style={[
                  styles.currencyChip,
                  selectedCurrency === currency.code && styles.selectedChip
                ]}
                textStyle={styles.chipText}
                avatar={<Text>{currency.flag}</Text>}
              >
                {currency.code}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <List.Section title="Todas as Moedas">
            {currencies.map((currency) => (
              <List.Item
                key={currency.code}
                title={`${currency.flag} ${currency.name}`}
                description={`${currency.code} - ${currency.symbol}`}
                left={() => (
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  </View>
                )}
                right={() => (
                  selectedCurrency === currency.code ? (
                    <List.Icon icon="check" color="#4CAF50" />
                  ) : null
                )}
                onPress={() => setSelectedCurrency(currency.code)}
                style={selectedCurrency === currency.code ? styles.selectedListItem : {}}
              />
            ))}
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📊 Taxas de Câmbio</Title>
          <Paragraph style={styles.description}>
            As taxas são atualizadas automaticamente e armazenadas em cache
          </Paragraph>
          
          <Surface style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Última atualização:</Text>
              <Text style={styles.statusValue}>{formatLastUpdated()}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                { color: isLoadingRates ? '#FF9800' : '#4CAF50' }
              ]}>
                {isLoadingRates ? 'Atualizando...' : 'Atualizado'}
              </Text>
            </View>
          </Surface>
          
          <Button
            mode="outlined"
            onPress={handleRefreshRates}
            loading={isLoadingRates}
            disabled={isLoadingRates}
            icon="refresh"
            style={styles.refreshButton}
          >
            {isLoadingRates ? 'Atualizando...' : 'Atualizar Taxas'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>💡 Exemplos de Conversão</Title>
          <Paragraph style={styles.description}>
            Exemplos com a moeda selecionada: {selectedCurrency}
          </Paragraph>
          
          <View style={styles.exampleContainer}>
            <View style={styles.exampleRow}>
              <Text style={styles.exampleValue}>
                {formatCurrency(100, selectedCurrency)}
              </Text>
              <Text style={styles.exampleLabel}>Cem unidades</Text>
            </View>
            
            <View style={styles.exampleRow}>
              <Text style={styles.exampleValue}>
                {formatCurrency(25.50, selectedCurrency)}
              </Text>
              <Text style={styles.exampleLabel}>Vinte e cinco e meio</Text>
            </View>
            
            <View style={styles.exampleRow}>
              <Text style={styles.exampleValue}>
                {formatCurrency(1234.56, selectedCurrency)}
              </Text>
              <Text style={styles.exampleLabel}>Mil duzentos e trinta e quatro</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Cancelar
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.actionButton}
          disabled={selectedCurrency === defaultCurrency}
        >
          Salvar Configurações
        </Button>
      </View>
      
      <View style={styles.bottomSpacer} />
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
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  currencyChip: {
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  currencyInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  currencyFlag: {
    fontSize: 24,
  },
  selectedListItem: {
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontWeight: '500',
    color: '#666',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 8,
  },
  exampleContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  exampleLabel: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default CurrencySettingsScreen;
