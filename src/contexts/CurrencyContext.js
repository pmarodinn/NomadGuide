import React, { createContext, useContext, useEffect, useState } from 'react';
import { currencyService } from '../services/currencyService';

const CurrencyContext = createContext({});

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load cached exchange rates on mount
  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await currencyService.getExchangeRates(forceRefresh);
      
      if (result.rates) {
        setExchangeRates(result.rates);
        setLastUpdate(new Date());
      }
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateExchangeRates = async () => {
    return await loadExchangeRates(true);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || !exchangeRates) return amount;
    return currencyService.convertAmount(amount, fromCurrency, toCurrency, exchangeRates);
  };

  const formatCurrency = (amount, currencyCode, options = {}) => {
    return currencyService.formatCurrency(amount, currencyCode, options);
  };

  const getConversionPreview = (amount, fromCurrency, toCurrency) => {
    return currencyService.getConversionPreview(amount, fromCurrency, toCurrency, exchangeRates);
  };

  const getSupportedCurrencies = () => {
    return currencyService.getSupportedCurrencies();
  };

  const getPopularCurrencies = () => {
    return currencyService.getPopularCurrencies();
  };

  const getCurrencyInfo = (currencyCode) => {
    return currencyService.getCurrencyInfo(currencyCode);
  };

  const isValidCurrency = (currencyCode) => {
    return currencyService.isValidCurrency(currencyCode);
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      const result = await currencyService.clearCache();
      if (result.success) {
        setExchangeRates({});
        setLastUpdate(null);
      }
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    exchangeRates,
    loading,
    error,
    lastUpdate,
    
    // Actions
    loadExchangeRates,
    updateExchangeRates,
    convertCurrency,
    formatCurrency,
    getConversionPreview,
    getSupportedCurrencies,
    getPopularCurrencies,
    getCurrencyInfo,
    isValidCurrency,
    clearCache,
    clearError,
    
    // Helper flags
    hasRates: Object.keys(exchangeRates).length > 0,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
