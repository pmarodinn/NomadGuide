import AsyncStorage from '@react-native-async-storage/async-storage';

const EXCHANGE_RATES_KEY = 'exchangeRates';
const LAST_UPDATE_KEY = 'lastExchangeRateUpdate';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Free API for exchange rates (fallback to mock data if API fails)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export const currencyService = {
  // Supported currencies
  supportedCurrencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  ],

  // Mock exchange rates (fallback)
  mockRates: {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45,
    BRL: 5.20,
    MXN: 20.0,
    INR: 74.5,
    KRW: 1180.0,
    SGD: 1.35,
    NOK: 8.5,
    SEK: 8.8,
    DKK: 6.3,
    PLN: 3.9,
    CZK: 21.5,
    HUF: 295.0,
    RUB: 73.5,
  },

  // Fetch exchange rates from API
  fetchExchangeRates: async () => {
    try {
      const response = await fetch(EXCHANGE_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      const rates = data.rates;
      
      // Store rates and update timestamp
      await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(rates));
      await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
      
      return { success: true, rates };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Fall back to mock rates
      const mockRates = currencyService.mockRates;
      await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(mockRates));
      await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
      
      return { success: false, rates: mockRates, error: error.message };
    }
  },

  // Get cached exchange rates
  getCachedRates: async () => {
    try {
      const ratesStr = await AsyncStorage.getItem(EXCHANGE_RATES_KEY);
      const lastUpdateStr = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      
      if (!ratesStr) {
        return null;
      }
      
      const rates = JSON.parse(ratesStr);
      const lastUpdate = lastUpdateStr ? parseInt(lastUpdateStr) : 0;
      const now = Date.now();
      
      // Check if rates are stale
      const isStale = (now - lastUpdate) > UPDATE_INTERVAL;
      
      return {
        rates,
        lastUpdate: new Date(lastUpdate),
        isStale,
      };
    } catch (error) {
      console.error('Error getting cached rates:', error);
      return null;
    }
  },

  // Get current exchange rates (cached or fetch new)
  getExchangeRates: async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await currencyService.getCachedRates();
        if (cached && !cached.isStale) {
          return { success: true, rates: cached.rates, cached: true };
        }
      }
      
      // Fetch new rates
      return await currencyService.fetchExchangeRates();
    } catch (error) {
      console.error('Error getting exchange rates:', error);
      
      // Try to return cached rates as fallback
      const cached = await currencyService.getCachedRates();
      if (cached) {
        return { success: false, rates: cached.rates, cached: true, error: error.message };
      }
      
      // Final fallback to mock rates
      return { success: false, rates: currencyService.mockRates, cached: false, error: error.message };
    }
  },

  // Convert amount between currencies
  convertAmount: (amount, fromCurrency, toCurrency, rates) => {
    if (!amount || !rates) return amount;
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
    const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  },

  // Format currency amount for display
  formatCurrency: (amount, currencyCode, options = {}) => {
    const {
      showSymbol = true,
      showCode = false,
      decimalPlaces = 2,
    } = options;
    
    if (amount === null || amount === undefined) return '';
    
    const currency = currencyService.supportedCurrencies.find(c => c.code === currencyCode);
    const symbol = currency ? currency.symbol : currencyCode;
    
    // Format number with proper decimal places
    const formattedAmount = parseFloat(amount).toFixed(decimalPlaces);
    
    // Build display string
    let result = formattedAmount;
    
    if (showSymbol && symbol) {
      // Some currencies show symbol after amount
      if (['EUR', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF'].includes(currencyCode)) {
        result = `${result} ${symbol}`;
      } else {
        result = `${symbol}${result}`;
      }
    }
    
    if (showCode) {
      result = `${result} ${currencyCode}`;
    }
    
    return result;
  },

  // Get currency info by code
  getCurrencyInfo: (currencyCode) => {
    return currencyService.supportedCurrencies.find(c => c.code === currencyCode) || null;
  },

  // Get list of supported currencies
  getSupportedCurrencies: () => {
    return currencyService.supportedCurrencies;
  },

  // Validate currency code
  isValidCurrency: (currencyCode) => {
    return currencyService.supportedCurrencies.some(c => c.code === currencyCode);
  },

  // Get popular/common currencies
  getPopularCurrencies: () => {
    const popularCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'BRL', 'MXN'];
    return currencyService.supportedCurrencies.filter(c => popularCodes.includes(c.code));
  },

  // Clear cached data
  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(EXCHANGE_RATES_KEY);
      await AsyncStorage.removeItem(LAST_UPDATE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing currency cache:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate conversion preview
  getConversionPreview: (amount, fromCurrency, toCurrency, rates) => {
    if (!rates || fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency,
        isConverted: false,
      };
    }
    
    const convertedAmount = currencyService.convertAmount(amount, fromCurrency, toCurrency, rates);
    const rate = currencyService.convertAmount(1, fromCurrency, toCurrency, rates);
    
    return {
      originalAmount: amount,
      convertedAmount,
      rate,
      fromCurrency,
      toCurrency,
      isConverted: true,
    };
  },
};

export default currencyService;
