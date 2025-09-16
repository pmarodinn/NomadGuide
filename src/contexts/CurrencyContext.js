import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import currencyService, { SUPPORTED_CURRENCIES } from '../services/currencyService';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext({});

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const { userId } = useAuth();
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // Carregar taxas de câmbio
  const loadExchangeRates = useCallback(async (baseCurrency = 'USD') => {
    if (isLoadingRates) return;
    
    setIsLoadingRates(true);
    try {
      const rates = await currencyService.fetchExchangeRates(baseCurrency);
      setExchangeRates(prev => ({
        ...prev,
        [baseCurrency]: rates
      }));
      setLastUpdated(new Date());
      console.log(`✅ Exchange rates loaded for ${baseCurrency}`);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    } finally {
      setIsLoadingRates(false);
    }
  }, [isLoadingRates]);

  // Carregar taxas iniciais
  useEffect(() => {
    if (userId) {
      loadExchangeRates(defaultCurrency);
    }
  }, [userId, defaultCurrency, loadExchangeRates]);

  // Converter valor entre moedas
  const convertCurrency = useCallback(async (amount, fromCurrency, toCurrency) => {
    if (!amount || amount === 0) return 0;
    return await currencyService.convertCurrency(amount, fromCurrency, toCurrency);
  }, []);

  // Converter múltiplas transações
  const convertTransactions = useCallback(async (transactions, targetCurrency) => {
    return await currencyService.convertTransactions(transactions, targetCurrency);
  }, []);

  // Formatar valor com moeda
  const formatCurrency = useCallback((amount, currencyCode, locale = 'pt-BR') => {
    return currencyService.formatCurrency(amount, currencyCode, locale);
  }, []);

  // Obter informações da moeda
  const getCurrencyInfo = useCallback((currencyCode) => {
    return currencyService.getCurrencyInfo(currencyCode);
  }, []);

  // Obter todas as moedas suportadas
  const getSupportedCurrencies = useCallback(() => {
    return currencyService.getSupportedCurrencies();
  }, []);

  // Atualizar taxas manualmente
  const refreshExchangeRates = useCallback(async (baseCurrency = defaultCurrency) => {
    await loadExchangeRates(baseCurrency);
  }, [defaultCurrency, loadExchangeRates]);

  // Calcular total de transações convertidas
  const calculateConvertedTotal = useCallback(async (transactions, targetCurrency) => {
    let total = 0;
    
    for (const transaction of transactions) {
      const convertedAmount = await convertCurrency(
        transaction.amount,
        transaction.currency || 'USD',
        targetCurrency
      );
      total += convertedAmount;
    }
    
    return total;
  }, [convertCurrency]);

  // Obter taxa de câmbio específica
  const getExchangeRate = useCallback(async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return 1;
    
    try {
      const converted = await convertCurrency(1, fromCurrency, toCurrency);
      return converted;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 1;
    }
  }, [convertCurrency]);

  // Detectar moeda por país
  const detectCurrencyByCountry = useCallback((countryCode) => {
    return currencyService.detectCurrencyByCountry(countryCode);
  }, []);

  // Obter histórico de conversão
  const getConversionHistory = useCallback((transactions, baseCurrency) => {
    const history = {};
    
    transactions.forEach(transaction => {
      const currency = transaction.currency || 'USD';
      if (!history[currency]) {
        history[currency] = {
          currency,
          totalOriginal: 0,
          totalConverted: 0,
          count: 0,
          transactions: []
        };
      }
      
      history[currency].totalOriginal += transaction.amount;
      history[currency].count += 1;
      history[currency].transactions.push(transaction);
    });
    
    return Object.values(history);
  }, []);

  const value = {
    // Estados
    exchangeRates,
    isLoadingRates,
    lastUpdated,
    defaultCurrency,
    
    // Setters
    setDefaultCurrency,
    
    // Funções de conversão
    convertCurrency,
    convertTransactions,
    calculateConvertedTotal,
    getExchangeRate,
    
    // Funções de formatação
    formatCurrency,
    getCurrencyInfo,
    getSupportedCurrencies,
    
    // Funções utilitárias
    refreshExchangeRates,
    detectCurrencyByCountry,
    getConversionHistory,
    loadExchangeRates,
    
    // Constantes
    SUPPORTED_CURRENCIES
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
