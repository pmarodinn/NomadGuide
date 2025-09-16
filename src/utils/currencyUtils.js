/**
 * Format a number as Brazilian currency (R$)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show the R$ symbol (default: true)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? 'R$ 0,00' : '0,00';
  }

  const formatted = amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `R$ ${formatted}` : formatted;
};

/**
 * Parse a currency string back to number
 * @param {string} currencyString - Currency string (e.g., "R$ 1.234,56" or "1.234,56")
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') return 0;

  // Remove currency symbol and spaces
  let cleanString = currencyString
    .replace(/R\$?\s?/g, '')
    .trim();

  // Handle Brazilian number format (1.234,56)
  // First, replace dots with empty string (thousand separators)
  // Then replace comma with dot (decimal separator)
  cleanString = cleanString
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format amount with color based on type
 * @param {number} amount - Amount to format
 * @param {'income'|'expense'} type - Transaction type
 * @returns {Object} - Object with formatted amount and color
 */
export const formatAmountWithColor = (amount, type) => {
  const formatted = formatCurrency(amount);
  const color = type === 'income' ? '#4CAF50' : '#F44336'; // Green for income, red for expense
  const prefix = type === 'income' ? '+ ' : '- ';

  return {
    text: `${prefix}${formatted}`,
    color,
    amount: formatted,
    prefix
  };
};

/**
 * Get balance color based on amount
 * @param {number} balance - Balance amount
 * @returns {string} - Color hex code
 */
export const getBalanceColor = (balance) => {
  if (balance > 0) return '#4CAF50'; // Green for positive
  if (balance < 0) return '#F44336'; // Red for negative
  return '#757575'; // Gray for zero
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate percentage of spending vs budget
 * @param {number} spent - Amount spent
 * @param {number} budget - Total budget
 * @returns {number} - Percentage (0-100)
 */
export const calculateSpendingPercentage = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

/**
 * Get spending status color based on percentage
 * @param {number} percentage - Spending percentage (0-100)
 * @returns {string} - Color hex code
 */
export const getSpendingStatusColor = (percentage) => {
  if (percentage <= 50) return '#4CAF50'; // Green - good
  if (percentage <= 80) return '#FF9800'; // Orange - warning
  return '#F44336'; // Red - danger
};
