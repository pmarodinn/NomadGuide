import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  List, 
  Divider,
  Button,
  Text,
  Chip,
  useTheme,
  Searchbar
} from 'react-native-paper';
import { useCurrencyContext } from '../contexts/CurrencyContext';

const CurrencySettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { 
    getSupportedCurrencies, 
    defaultCurrency, 
    setDefaultCurrency,
    refreshExchangeRates,
    isLoadingRates,
    lastUpdated
  } = useCurrencyContext();

  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const allCurrencies = useMemo(() => getSupportedCurrencies(), [getSupportedCurrencies]);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return allCurrencies;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allCurrencies.filter(c => 
      c.name.toLowerCase().includes(lowercasedQuery) || 
      c.code.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, allCurrencies]);

  const handleSave = () => {
    setDefaultCurrency(selectedCurrency);
    navigation.goBack();
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nunca';
    const now = new Date();
    const diffSeconds = Math.floor((now - new Date(lastUpdated)) / 1000);
    if (diffSeconds < 60) return `Há ${diffSeconds} seg`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `Há ${diffHours}h`;
  };

  const renderCurrencyItem = ({ item }) => (
    <List.Item
      key={item.code}
      title={`${item.flag} ${item.name}`}
      description={`${item.code} - ${item.symbol}`}
      right={() => (
        selectedCurrency === item.code ? (
          <List.Icon icon="check-circle" color={theme.colors.primary} />
        ) : null
      )}
      onPress={() => setSelectedCurrency(item.code)}
      style={[
        styles.listItem,
        selectedCurrency === item.code && { backgroundColor: theme.colors.primaryContainer }
      ]}
      titleStyle={[
        selectedCurrency === item.code && { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }
      ]}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Moeda Padrão</Title>
            <Paragraph style={styles.description}>
              Esta será a moeda principal para orçamentos e relatórios.
            </Paragraph>
            
            <Searchbar
              placeholder="Buscar moeda (ex: Dólar, USD)"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              elevation={1}
            />
          </Card.Content>
        </Card>

        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={item => item.code}
          style={styles.list}
          ListEmptyComponent={
            <Card style={styles.card}><Card.Content><Paragraph>Nenhuma moeda encontrada.</Paragraph></Card.Content></Card>
          }
        />
        
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Taxas de Câmbio</Title>
            <View style={styles.statusRow}>
              <Chip icon="clock-outline">{`Atualizado: ${formatLastUpdated()}`}</Chip>
              <Chip 
                icon={isLoadingRates ? "sync" : "check-circle"}
                style={{ backgroundColor: isLoadingRates ? theme.colors.tertiaryContainer : theme.colors.secondaryContainer }}
              >
                {isLoadingRates ? 'Atualizando...' : 'Sincronizado'}
              </Chip>
            </View>
            <Button
              mode="outlined"
              onPress={refreshExchangeRates}
              loading={isLoadingRates}
              disabled={isLoadingRates}
              icon="refresh"
              style={styles.refreshButton}
            >
              Forçar Atualização
            </Button>
          </Card.Content>
        </Card>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomActions, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          disabled={selectedCurrency === defaultCurrency}
        >
          Salvar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  searchbar: {
    borderRadius: 12,
    marginBottom: 8,
  },
  list: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  listItem: {
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  refreshButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: 24, // Safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
  },
});

export default CurrencySettingsScreen;
