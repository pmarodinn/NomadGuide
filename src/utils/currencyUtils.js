// Currency conversion and formatting utilities for NomadGuide

export const currencyUtils = {
  // Popular currencies with their symbols and codes
  currencies: {
    USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
    JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
    CHF: { symbol: 'Fr', name: 'Swiss Franc', code: 'CHF' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
    SEK: { symbol: 'kr', name: 'Swedish Krona', code: 'SEK' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', code: 'NZD' },
    MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', code: 'HKD' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone', code: 'NOK' },
    KRW: { symbol: '₩', name: 'South Korean Won', code: 'KRW' },
    TRY: { symbol: '₺', name: 'Turkish Lira', code: 'TRY' },
    RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB' },
    INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
    BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL' },
    ZAR: { symbol: 'R', name: 'South African Rand', code: 'ZAR' },
    PLN: { symbol: 'zł', name: 'Polish Zloty', code: 'PLN' },
    CZK: { symbol: 'Kč', name: 'Czech Koruna', code: 'CZK' },
    DKK: { symbol: 'kr', name: 'Danish Krone', code: 'DKK' },
    HUF: { symbol: 'Ft', name: 'Hungarian Forint', code: 'HUF' },
    ILS: { symbol: '₪', name: 'Israeli Shekel', code: 'ILS' },
    CLP: { symbol: '$', name: 'Chilean Peso', code: 'CLP' },
    PHP: { symbol: '₱', name: 'Philippine Peso', code: 'PHP' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', code: 'AED' },
    COP: { symbol: '$', name: 'Colombian Peso', code: 'COP' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal', code: 'SAR' },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit', code: 'MYR' },
    RON: { symbol: 'lei', name: 'Romanian Leu', code: 'RON' },
    THB: { symbol: '฿', name: 'Thai Baht', code: 'THB' },
    BGN: { symbol: 'лв', name: 'Bulgarian Lev', code: 'BGN' },
    HRK: { symbol: 'kn', name: 'Croatian Kuna', code: 'HRK' },
    ISK: { symbol: 'kr', name: 'Icelandic Krona', code: 'ISK' },
  },

  // Get currency info
  getCurrencyInfo: (code) => {
    return currencyUtils.currencies[code] || { symbol: code, name: code, code };
  },

  // Get all available currencies as array
  getAllCurrencies: () => {
    return Object.values(currencyUtils.currencies).sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get popular currencies (most commonly used)
  getPopularCurrencies: () => {
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'];
    return popular.map(code => currencyUtils.currencies[code]).filter(Boolean);
  },

  // Convert amount between currencies
  convertAmount: (amount, fromCurrency, toCurrency, exchangeRates = {}) => {
    if (!amount || !fromCurrency || !toCurrency) return 0;
    if (fromCurrency === toCurrency) return amount;

    // If converting from base currency (usually USD)
    if (fromCurrency === 'USD' && exchangeRates[toCurrency]) {
      return amount * exchangeRates[toCurrency];
    }

    // If converting to base currency (usually USD)
    if (toCurrency === 'USD' && exchangeRates[fromCurrency]) {
      return amount / exchangeRates[fromCurrency];
    }

    // Converting between two non-base currencies
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      const usdAmount = amount / exchangeRates[fromCurrency];
      return usdAmount * exchangeRates[toCurrency];
    }

    // If no exchange rate available, return original amount
    console.warn(`No exchange rate available for ${fromCurrency} to ${toCurrency}`);
    return amount;
  },

  // Format amount with currency
  formatCurrencyAmount: (amount, currency = 'USD', options = {}) => {
    const {
      locale = 'en-US',
      showCode = false,
      showSymbol = true,
      decimalPlaces = 2,
      compact = false,
    } = options;

    if (amount === null || amount === undefined || isNaN(amount)) return '';

    const currencyInfo = currencyUtils.getCurrencyInfo(currency);

    try {
      if (compact && Math.abs(amount) >= 1000) {
        // Format large numbers compactly (1.2K, 1.5M, etc.)
        const formatter = new Intl.NumberFormat(locale, {
          style: showSymbol ? 'currency' : 'decimal',
          currency: currency,
          notation: 'compact',
          maximumFractionDigits: 1,
        });
        return formatter.format(amount);
      }

      const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });

      let formatted = formatter.format(amount);

      if (showCode && !showSymbol) {
        formatted = `${formatted} ${currency}`;
      }

      return formatted;
    } catch (error) {
      // Fallback formatting
      const absAmount = Math.abs(amount);
      const sign = amount < 0 ? '-' : '';
      
      if (compact && absAmount >= 1000000) {
        return `${sign}${showSymbol ? currencyInfo.symbol : ''}${(absAmount / 1000000).toFixed(1)}M${showCode ? ` ${currency}` : ''}`;
      } else if (compact && absAmount >= 1000) {
        return `${sign}${showSymbol ? currencyInfo.symbol : ''}${(absAmount / 1000).toFixed(1)}K${showCode ? ` ${currency}` : ''}`;
      }

      const formattedAmount = absAmount.toFixed(decimalPlaces);
      if (showSymbol) {
        return `${sign}${currencyInfo.symbol}${formattedAmount}${showCode ? ` ${currency}` : ''}`;
      }
      
      return `${sign}${formattedAmount}${showCode ? ` ${currency}` : ''}`;
    }
  },

  // Parse amount from string (remove currency symbols, etc.)
  parseAmount: (amountString) => {
    if (typeof amountString === 'number') return amountString;
    if (!amountString || typeof amountString !== 'string') return 0;

    // Remove currency symbols and other non-numeric characters except decimal point and minus
    const cleaned = amountString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
  },

  // Validate currency code
  isValidCurrency: (code) => {
    return code && typeof code === 'string' && currencyUtils.currencies.hasOwnProperty(code.toUpperCase());
  },

  // Get currency symbol
  getCurrencySymbol: (code) => {
    const currency = currencyUtils.currencies[code];
    return currency ? currency.symbol : code;
  },

  // Get exchange rate age in hours
  getExchangeRateAge: (lastUpdated) => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const updated = lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated);
    const ageInHours = (now - updated) / (1000 * 60 * 60);
    
    return Math.floor(ageInHours);
  },

  // Check if exchange rates are stale (older than 24 hours)
  areRatesStale: (lastUpdated, maxAgeHours = 24) => {
    const ageInHours = currencyUtils.getExchangeRateAge(lastUpdated);
    return ageInHours === null || ageInHours > maxAgeHours;
  },

  // Format exchange rate for display
  formatExchangeRate: (fromCurrency, toCurrency, rate, options = {}) => {
    const { precision = 4, showCurrencies = true } = options;
    
    if (!rate || rate <= 0) return '';
    
    const formattedRate = rate.toFixed(precision);
    
    if (showCurrencies) {
      return `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
    }
    
    return formattedRate;
  },

  // Calculate percentage change in exchange rate
  calculateRateChange: (currentRate, previousRate) => {
    if (!currentRate || !previousRate || previousRate === 0) return 0;
    
    return ((currentRate - previousRate) / previousRate) * 100;
  },

  // Get localized currency name
  getLocalizedCurrencyName: (code, locale = 'en-US') => {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: 'currency' });
      return displayNames.of(code);
    } catch (error) {
      const currency = currencyUtils.currencies[code];
      return currency ? currency.name : code;
    }
  },

  // Round to appropriate decimal places for currency
  roundForCurrency: (amount, currency = 'USD') => {
    // Some currencies don't use decimal places (JPY, KRW, etc.)
    const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF'];
    
    if (noDecimalCurrencies.includes(currency)) {
      return Math.round(amount);
    }
    
    // Most currencies use 2 decimal places
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  },

  // Get currency flag emoji (limited coverage)
  getCurrencyFlag: (code) => {
    const flagMap = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦',
      AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳', SEK: '🇸🇪', NZD: '🇳🇿',
      MXN: '🇲🇽', SGD: '🇸🇬', HKD: '🇭🇰', NOK: '🇳🇴', KRW: '🇰🇷',
      TRY: '🇹🇷', RUB: '🇷🇺', INR: '🇮🇳', BRL: '🇧🇷', ZAR: '🇿🇦',
      PLN: '🇵🇱', CZK: '🇨🇿', DKK: '🇩🇰', HUF: '🇭🇺', ILS: '🇮🇱',
      CLP: '🇨🇱', PHP: '🇵🇭', AED: '🇦🇪', COP: '🇨🇴', SAR: '🇸🇦',
      MYR: '🇲🇾', RON: '🇷🇴', THB: '🇹🇭', BGN: '🇧🇬', HRK: '🇭🇷',
      ISK: '🇮🇸',
    };
    
    return flagMap[code] || '💱';
  },
};

export default currencyUtils;
