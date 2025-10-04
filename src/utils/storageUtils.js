// Storage utilities for local data persistence in NomadGuide

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageUtils = {
  // Storage keys
  keys: {
    USER_PREFERENCES: 'user_preferences',
    CURRENCY_RATES: 'currency_rates',
    OFFLINE_TRANSACTIONS: 'offline_transactions',
    CACHED_TRIPS: 'cached_trips',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE_PREFERENCE: 'language_preference',
    NOTIFICATION_SETTINGS: 'notification_settings',
    LAST_SYNC: 'last_sync',
    APP_VERSION: 'app_version',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    BIOMETRIC_ENABLED: 'biometric_enabled',
    AUTO_BACKUP_ENABLED: 'auto_backup_enabled',
    CATEGORIES_CACHE: 'categories_cache',
    EXCHANGE_RATE_PROVIDER: 'exchange_rate_provider',
    DEFAULT_CURRENCY: 'default_currency',
  },

  // Generic storage methods
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  getItem: async (key, defaultValue = null) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return defaultValue;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  },

  // User preferences
  saveUserPreferences: async (preferences) => {
    return await storageUtils.setItem(storageUtils.keys.USER_PREFERENCES, {
      ...preferences,
      lastUpdated: new Date().toISOString(),
    });
  },

  getUserPreferences: async () => {
    const defaultPreferences = {
      currency: 'USD',
      language: 'en',
      theme: 'light',
      notifications: true,
      biometricAuth: false,
      autoBackup: true,
      chartAnimations: true,
      compactMode: false,
    };
    
    return await storageUtils.getItem(storageUtils.keys.USER_PREFERENCES, defaultPreferences);
  },

  // Currency rates caching
  saveCurrencyRates: async (rates, baseCurrency = 'USD') => {
    const rateData = {
      rates,
      baseCurrency,
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    return await storageUtils.setItem(storageUtils.keys.CURRENCY_RATES, rateData);
  },

  getCurrencyRates: async () => {
    const rateData = await storageUtils.getItem(storageUtils.keys.CURRENCY_RATES);
    
    if (!rateData) return null;
    
    // Check if rates are expired
    const expiresAt = new Date(rateData.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      await storageUtils.removeItem(storageUtils.keys.CURRENCY_RATES);
      return null;
    }
    
    return rateData;
  },

  // Offline transactions
  saveOfflineTransaction: async (transaction) => {
    try {
      const offlineTransactions = await storageUtils.getOfflineTransactions();
      const updatedTransactions = [
        ...offlineTransactions,
        {
          ...transaction,
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          synced: false,
        },
      ];
      
      return await storageUtils.setItem(storageUtils.keys.OFFLINE_TRANSACTIONS, updatedTransactions);
    } catch (error) {
      console.error('Error saving offline transaction:', error);
      return false;
    }
  },

  getOfflineTransactions: async () => {
    return await storageUtils.getItem(storageUtils.keys.OFFLINE_TRANSACTIONS, []);
  },

  markTransactionsSynced: async (transactionIds) => {
    try {
      const offlineTransactions = await storageUtils.getOfflineTransactions();
      const updatedTransactions = offlineTransactions.filter(
        transaction => !transactionIds.includes(transaction.id)
      );
      
      return await storageUtils.setItem(storageUtils.keys.OFFLINE_TRANSACTIONS, updatedTransactions);
    } catch (error) {
      console.error('Error marking transactions as synced:', error);
      return false;
    }
  },

  clearOfflineTransactions: async () => {
    return await storageUtils.removeItem(storageUtils.keys.OFFLINE_TRANSACTIONS);
  },

  // Cached trips
  saveCachedTrips: async (trips) => {
    const tripData = {
      trips,
      lastUpdated: new Date().toISOString(),
    };
    
    return await storageUtils.setItem(storageUtils.keys.CACHED_TRIPS, tripData);
  },

  getCachedTrips: async () => {
    const tripData = await storageUtils.getItem(storageUtils.keys.CACHED_TRIPS);
    return tripData ? tripData.trips : [];
  },

  // Theme preference
  saveThemePreference: async (theme) => {
    return await storageUtils.setItem(storageUtils.keys.THEME_PREFERENCE, theme);
  },

  getThemePreference: async () => {
    return await storageUtils.getItem(storageUtils.keys.THEME_PREFERENCE, 'light');
  },

  // Language preference
  saveLanguagePreference: async (language) => {
    return await storageUtils.setItem(storageUtils.keys.LANGUAGE_PREFERENCE, language);
  },

  getLanguagePreference: async () => {
    return await storageUtils.getItem(storageUtils.keys.LANGUAGE_PREFERENCE, 'en');
  },

  // Notification settings
  saveNotificationSettings: async (settings) => {
    const notificationData = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    
    return await storageUtils.setItem(storageUtils.keys.NOTIFICATION_SETTINGS, notificationData);
  },

  getNotificationSettings: async () => {
    const defaultSettings = {
      enabled: true,
      medicationReminders: true,
      budgetAlerts: true,
      dailyReports: false,
      weeklyReports: true,
      exchangeRateAlerts: false,
      sound: true,
      vibration: true,
    };
    
    const settings = await storageUtils.getItem(storageUtils.keys.NOTIFICATION_SETTINGS, defaultSettings);
    return { ...defaultSettings, ...settings };
  },

  // Last sync timestamp
  saveLastSync: async () => {
    return await storageUtils.setItem(storageUtils.keys.LAST_SYNC, new Date().toISOString());
  },

  getLastSync: async () => {
    return await storageUtils.getItem(storageUtils.keys.LAST_SYNC);
  },

  // App version tracking
  saveAppVersion: async (version) => {
    return await storageUtils.setItem(storageUtils.keys.APP_VERSION, version);
  },

  getAppVersion: async () => {
    return await storageUtils.getItem(storageUtils.keys.APP_VERSION);
  },

  // Onboarding status
  saveOnboardingCompleted: async (completed = true) => {
    return await storageUtils.setItem(storageUtils.keys.ONBOARDING_COMPLETED, completed);
  },

  getOnboardingCompleted: async () => {
    return await storageUtils.getItem(storageUtils.keys.ONBOARDING_COMPLETED, false);
  },

  // Biometric authentication
  saveBiometricEnabled: async (enabled) => {
    return await storageUtils.setItem(storageUtils.keys.BIOMETRIC_ENABLED, enabled);
  },

  getBiometricEnabled: async () => {
    return await storageUtils.getItem(storageUtils.keys.BIOMETRIC_ENABLED, false);
  },

  // Auto-backup setting
  saveAutoBackupEnabled: async (enabled) => {
    return await storageUtils.setItem(storageUtils.keys.AUTO_BACKUP_ENABLED, enabled);
  },

  getAutoBackupEnabled: async () => {
    return await storageUtils.getItem(storageUtils.keys.AUTO_BACKUP_ENABLED, true);
  },

  // Categories cache
  saveCategoriesCache: async (categories) => {
    const categoryData = {
      categories,
      lastUpdated: new Date().toISOString(),
    };
    
    return await storageUtils.setItem(storageUtils.keys.CATEGORIES_CACHE, categoryData);
  },

  getCategoriesCache: async () => {
    const categoryData = await storageUtils.getItem(storageUtils.keys.CATEGORIES_CACHE);
    return categoryData ? categoryData.categories : [];
  },

  // Exchange rate provider
  saveExchangeRateProvider: async (provider) => {
    return await storageUtils.setItem(storageUtils.keys.EXCHANGE_RATE_PROVIDER, provider);
  },

  getExchangeRateProvider: async () => {
    return await storageUtils.getItem(storageUtils.keys.EXCHANGE_RATE_PROVIDER, 'exchangerate-api');
  },

  // Default currency
  saveDefaultCurrency: async (currency) => {
    return await storageUtils.setItem(storageUtils.keys.DEFAULT_CURRENCY, currency);
  },

  getDefaultCurrency: async () => {
    return await storageUtils.getItem(storageUtils.keys.DEFAULT_CURRENCY, 'USD');
  },

  // Utility methods
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  getStorageSize: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        keys: keys.length,
        sizeInBytes: totalSize,
        sizeInKB: Math.round(totalSize / 1024),
        sizeInMB: Math.round(totalSize / (1024 * 1024)),
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { keys: 0, sizeInBytes: 0, sizeInKB: 0, sizeInMB: 0 };
    }
  },

  clearAllData: async (preserveUserPreferences = true) => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = preserveUserPreferences
        ? keys.filter(key => key !== storageUtils.keys.USER_PREFERENCES)
        : keys;
      
      await AsyncStorage.multiRemove(keysToRemove);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  // Export/Import functionality
  exportData: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }
      
      return {
        data,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  importData: async (importData, overwrite = false) => {
    try {
      if (!importData || !importData.data) {
        throw new Error('Invalid import data');
      }
      
      const entries = Object.entries(importData.data);
      
      for (const [key, value] of entries) {
        if (overwrite || !(await AsyncStorage.getItem(key))) {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Check if storage is available
  isStorageAvailable: async () => {
    try {
      const testKey = '_test_storage_available_';
      const testValue = 'test';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      return retrievedValue === testValue;
    } catch (error) {
      console.error('Storage availability check failed:', error);
      return false;
    }
  },
};

export default storageUtils;
