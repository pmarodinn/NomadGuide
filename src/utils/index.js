// Central export for all NomadGuide utilities

export { default as dateUtils } from './dateUtils';
export { default as balanceUtils } from './balanceUtils';
export { default as currencyUtils } from './currencyUtils';
export { default as validationUtils } from './validationUtils';
export { default as chartUtils } from './chartUtils';
export { default as storageUtils } from './storageUtils';
export { default as notificationUtils } from './notificationUtils';

// Re-export commonly used functions for convenience
export {
  formatDate,
  getTripDuration,
  getTripProgress,
  isDateInRange,
  getDaysUntil,
  getNextRecurrenceDate,
} from './dateUtils';

export {
  calculateCurrentBalance,
  calculateTotalSpent,
  calculateDailyAverage,
  formatAmount,
  getBalanceStatus,
} from './balanceUtils';

export {
  formatCurrencyAmount,
  convertAmount,
  getCurrencyInfo,
  getAllCurrencies,
  parseAmount,
} from './currencyUtils';

export {
  validateEmail,
  validatePassword,
  validateAmount,
  validateTrip,
  validateTransaction,
} from './validationUtils';

export {
  processSpendingData,
  processCategoryData,
  processMonthlyTrends,
  formatForChartKit,
  getChartConfig,
} from './chartUtils';

export {
  saveUserPreferences,
  getUserPreferences,
  saveCurrencyRates,
  getCurrencyRates,
  saveOfflineTransaction,
  getOfflineTransactions,
} from './storageUtils';

export {
  requestPermissions,
  scheduleMedicationReminder,
  scheduleBudgetAlert,
  cancelNotification,
  showNotification,
} from './notificationUtils';
