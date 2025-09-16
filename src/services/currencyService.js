import AsyncStorage from '@react-native-async-storage/async-storage';

// Lista de moedas suportadas
export const SUPPORTED_CURRENCIES = {
  BRL: { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  USD: { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  GBP: { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  JPY: { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  CAD: { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  AUD: { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  CHF: { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr', flag: '🇨🇭' },
  CNY: { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
  SEK: { code: 'SEK', name: 'Coroa Sueca', symbol: 'kr', flag: '🇸🇪' },
  NOK: { code: 'NOK', name: 'Coroa Norueguesa', symbol: 'kr', flag: '🇳🇴' },
  DKK: { code: 'DKK', name: 'Coroa Dinamarquesa', symbol: 'kr', flag: '🇩🇰' },
  PLN: { code: 'PLN', name: 'Zloty Polonês', symbol: 'zł', flag: '🇵🇱' },
  CZK: { code: 'CZK', name: 'Coroa Tcheca', symbol: 'Kč', flag: '🇨🇿' },
  HUF: { code: 'HUF', name: 'Forint Húngaro', symbol: 'Ft', flag: '🇭🇺' },
  RUB: { code: 'RUB', name: 'Rublo Russo', symbol: '₽', flag: '🇷🇺' },
  TRY: { code: 'TRY', name: 'Lira Turca', symbol: '₺', flag: '🇹🇷' },
  INR: { code: 'INR', name: 'Rupia Indiana', symbol: '₹', flag: '🇮🇳' },
  KRW: { code: 'KRW', name: 'Won Sul-Coreano', symbol: '₩', flag: '🇰🇷' },
  SGD: { code: 'SGD', name: 'Dólar de Singapura', symbol: 'S$', flag: '🇸🇬' },
  MXN: { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  ARS: { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  CLP: { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  COP: { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
  PEN: { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
  UYU: { code: 'UYU', name: 'Peso Uruguaio', symbol: '$', flag: '🇺🇾' }
};

// Cache de taxas de câmbio
const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hora em milliseconds

class CurrencyService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
  }

  /**
   * Busca taxas de câmbio da API
   * Usando a API gratuita exchangerate-api.com
   */
  async fetchExchangeRates(baseCurrency = 'USD') {
    try {
      // Verificar cache primeiro
      const cached = await this.getCachedRates(baseCurrency);
      if (cached) {
        console.log('📊 Using cached exchange rates');
        return cached;
      }

      console.log('🌐 Fetching fresh exchange rates...');
      
      // API gratuita - exchangerate-api.com (1500 requests/month grátis)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.rates) {
        throw new Error('Invalid response format');
      }

      // Salvar no cache
      await this.cacheRates(baseCurrency, data.rates);
      
      console.log('✅ Exchange rates fetched successfully');
      return data.rates;
      
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error);
      
      // Tentar usar cache expirado como fallback
      const oldCache = await AsyncStorage.getItem(`${CACHE_KEY}_${baseCurrency}`);
      if (oldCache) {
        console.log('📊 Using expired cache as fallback');
        return JSON.parse(oldCache).rates;
      }
      
      // Últim fallback - taxas fixas aproximadas
      return this.getFallbackRates(baseCurrency);
    }
  }

  /**
   * Verifica se há taxas em cache válidas
   */
  async getCachedRates(baseCurrency) {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${baseCurrency}`);
      if (!cached) return null;

      const { rates, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      if (now - timestamp > CACHE_DURATION) {
        return null; // Cache expirado
      }
      
      return rates;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Salva taxas no cache
   */
  async cacheRates(baseCurrency, rates) {
    try {
      const cacheData = {
        rates,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(`${CACHE_KEY}_${baseCurrency}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching rates:', error);
    }
  }

  /**
   * Taxas de fallback (aproximadas) caso a API falhe
   */
  getFallbackRates(baseCurrency = 'USD') {
    const fallbackRates = {
      USD: {
        BRL: 5.20, EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25,
        AUD: 1.35, CHF: 0.92, CNY: 6.45, SEK: 8.5, NOK: 8.8,
        DKK: 6.3, PLN: 3.9, CZK: 22, HUF: 350, RUB: 75,
        TRY: 8.5, INR: 74, KRW: 1180, SGD: 1.35, MXN: 20,
        ARS: 98, CLP: 800, COP: 3800, PEN: 3.7, UYU: 44
      }
    };

    console.log('⚠️ Using fallback exchange rates');
    return fallbackRates[baseCurrency] || fallbackRates.USD;
  }

  /**
   * Converte valor entre moedas
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      // Se conversão for de/para USD, usar diretamente
      if (fromCurrency === 'USD') {
        const rates = await this.fetchExchangeRates('USD');
        return amount * (rates[toCurrency] || 1);
      }
      
      if (toCurrency === 'USD') {
        const rates = await this.fetchExchangeRates('USD');
        return amount / (rates[fromCurrency] || 1);
      }

      // Para outras conversões, usar USD como intermediário
      const usdRates = await this.fetchExchangeRates('USD');
      const amountInUSD = amount / (usdRates[fromCurrency] || 1);
      const finalAmount = amountInUSD * (usdRates[toCurrency] || 1);
      
      return finalAmount;
      
    } catch (error) {
      console.error('Error converting currency:', error);
      return amount; // Retorna valor original em caso de erro
    }
  }

  /**
   * Converte múltiplas transações para uma moeda base
   */
  async convertTransactions(transactions, targetCurrency) {
    const convertedTransactions = [];
    
    for (const transaction of transactions) {
      const originalAmount = transaction.amount;
      const originalCurrency = transaction.currency || 'USD';
      
      let convertedAmount = originalAmount;
      if (originalCurrency !== targetCurrency) {
        convertedAmount = await this.convertCurrency(
          originalAmount, 
          originalCurrency, 
          targetCurrency
        );
      }
      
      convertedTransactions.push({
        ...transaction,
        originalAmount,
        originalCurrency,
        convertedAmount,
        targetCurrency
      });
    }
    
    return convertedTransactions;
  }

  /**
   * Formata valor com símbolo da moeda
   */
  formatCurrency(amount, currencyCode, locale = 'pt-BR') {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    if (!currency) return `${amount.toFixed(2)}`;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback manual
      return `${currency.symbol} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Obtém informações da moeda
   */
  getCurrencyInfo(currencyCode) {
    return SUPPORTED_CURRENCIES[currencyCode] || null;
  }

  /**
   * Lista todas as moedas suportadas
   */
  getSupportedCurrencies() {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  /**
   * Detecta moeda do país (básico)
   */
  detectCurrencyByCountry(countryCode) {
    const countryToCurrency = {
      BR: 'BRL', US: 'USD', EU: 'EUR', GB: 'GBP',
      JP: 'JPY', CA: 'CAD', AU: 'AUD', CH: 'CHF',
      CN: 'CNY', SE: 'SEK', NO: 'NOK', DK: 'DKK',
      FI: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR',
      ES: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR',
      AT: 'EUR', IE: 'EUR', LU: 'EUR', GR: 'EUR',
      CY: 'EUR', MT: 'EUR', SI: 'EUR', SK: 'EUR',
      EE: 'EUR', LV: 'EUR', LT: 'EUR'
    };
    
    return countryToCurrency[countryCode?.toUpperCase()] || 'USD';
  }
}

// Instância singleton
export const currencyService = new CurrencyService();
export default currencyService;
