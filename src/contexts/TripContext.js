import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToTrips,
  subscribeToTransactions,
  subscribeToCategories,
  createTrip as createTripService,
  updateTrip as updateTripService,
  deleteTrip as deleteTripService,
  activateTrip as activateTripService,
  addTransaction as addTransactionService,
  addRecurringTransaction as addRecurringTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  initializeDefaultCategories,
  subscribeToRecurringTransactions,
  updateRecurringTransaction
} from '../services/tripService';

const TripContext = createContext({});

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};

// Backward compatibility
export const useTrip = useTripContext;

export const TripProvider = ({ children }) => {
  const { userId } = useAuth();
  const [trips, setTrips] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [categoriesInitializing, setCategoriesInitializing] = useState(false);

  // Initialize default categories for new users
  useEffect(() => {
    if (!userId || initialized) return;

    const initializeUser = async () => {
      try {
        let unsubscribe;
        let isFirstLoad = true;
        
        // Check if user already has categories
        unsubscribe = subscribeToCategories(userId, async (categoriesData) => {
          if (isFirstLoad && categoriesData.length === 0 && !categoriesInitializing) {
            // User has no categories, initialize defaults
            setCategoriesInitializing(true);
            try {
              await initializeDefaultCategories(userId);
              console.log('✅ Default categories initialized successfully');
            } catch (error) {
              console.error('❌ Error initializing default categories:', error);
            } finally {
              setCategoriesInitializing(false);
            }
          }
          setCategories(categoriesData);
          isFirstLoad = false;
        });
        
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing user:', error);
        setInitialized(true);
      }
    };

    initializeUser();
  }, [userId, initialized, categoriesInitializing]);

  // Listen to trips
  useEffect(() => {
    if (!userId) {
      setTrips([]);
      return;
    }

    const unsubscribe = subscribeToTrips(userId, (tripsData) => {
      setTrips(tripsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Listen to transactions
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    const unsubscribe = subscribeToTransactions(userId, (transactionsData) => {
      setTransactions(transactionsData);
    });

    return unsubscribe;
  }, [userId]);

  // Listen to categories
  useEffect(() => {
    if (!userId || !initialized) return;

    const unsubscribe = subscribeToCategories(userId, (categoriesData) => {
      setCategories(categoriesData);
    });

    return unsubscribe;
  }, [userId, initialized]);

  // Listen to recurring transactions
  useEffect(() => {
    if (!userId) {
      setRecurringTransactions([]);
      return;
    }

    const unsubscribe = subscribeToRecurringTransactions(userId, (data) => {
      setRecurringTransactions(data);
    });

    return unsubscribe;
  }, [userId]);

  // Trip management functions
  const createTrip = useCallback(async (tripData) => {
    if (!userId) throw new Error('User not authenticated');
    return await createTripService(userId, tripData);
  }, [userId]);

  const updateTrip = useCallback(async (tripId, updates) => {
    if (!userId) throw new Error('User not authenticated');
    return await updateTripService(userId, tripId, updates);
  }, [userId]);

  const deleteTrip = useCallback(async (tripId) => {
    if (!userId) throw new Error('User not authenticated');
    return await deleteTripService(userId, tripId);
  }, [userId]);

  const activateTrip = useCallback(async (tripId) => {
    if (!userId) throw new Error('User not authenticated');
    return await activateTripService(tripId, userId);
  }, [userId]);

  // Transaction management functions
  const addTransaction = useCallback(async (transactionData) => {
    if (!userId) throw new Error('User not authenticated');
    return await addTransactionService(userId, transactionData);
  }, [userId]);

  const addRecurringTransaction = useCallback(async (recurringTransactionData) => {
    if (!userId) throw new Error('User not authenticated');
    return await addRecurringTransactionService(userId, recurringTransactionData);
  }, [userId]);

  const updateTransaction = useCallback(async (transactionId, updates) => {
    if (!userId) throw new Error('User not authenticated');
    return await updateTransactionService(userId, transactionId, updates);
  }, [userId]);

  const deleteTransaction = useCallback(async (transactionId) => {
    if (!userId) throw new Error('User not authenticated');
    return await deleteTransactionService(userId, transactionId);
  }, [userId]);

  // Helper functions
  const getActiveTrip = useCallback(() => {
    return trips.find(trip => trip.isActive) || null;
  }, [trips]);

  const getTripTransactions = useCallback((tripId) => {
    return transactions.filter(transaction => transaction.tripId === tripId);
  }, [transactions]);

  const getTripBalance = useCallback((tripId) => {
    const tripTransactions = getTripTransactions(tripId);
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) return 0;
    
    const totalSpent = tripTransactions.reduce((sum, transaction) => {
      if (transaction.type === 'expense') {
        return sum + (transaction.amount || 0);
      } else if (transaction.type === 'income') {
        return sum - (transaction.amount || 0);
      }
      return sum;
    }, 0);
    
    return (trip.budget || 0) - totalSpent;
  }, [trips, transactions, getTripTransactions]);

  const getTripByCategory = useCallback((tripId, categoryId) => {
    return transactions.filter(transaction => 
      transaction.tripId === tripId && transaction.categoryId === categoryId
    );
  }, [transactions]);

  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  // Helper: compute projected balance including recurring occurrences up to today or end date
  const getProjectedBalance = useCallback((tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return 0;

    // Effective: budget minus executed transactions
    const base = (trip.budget || 0) - transactions
      .filter(t => t.tripId === tripId)
      .reduce((sum, t) => sum + (t.type === 'expense' ? (t.amount || 0) : -(t.amount || 0)), 0);

    // Projected impact from recurring transactions
    const today = new Date();
    const recurrences = recurringTransactions.filter(r => r.tripId === tripId);

    const projectImpact = recurrences.reduce((acc, r) => {
      const start = r.startDate?.toDate?.() || new Date(r.startDate);
      const end = r.endDate?.toDate?.() || new Date(r.endDate);
      if (!start || !end || start > end) return acc;

      // count occurrences up to min(today, end)
      const limit = today < end ? today : end;
      const msPerDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.floor((limit - start) / msPerDay);

      const freq = r.frequency; // daily, weekly, monthly, quarterly, biannual
      let occurrences = 0;
      if (freq === 'daily') {
        occurrences = diffDays + 1;
      } else if (freq === 'weekly') {
        occurrences = Math.floor(diffDays / 7) + 1;
      } else if (freq === 'monthly') {
        occurrences = Math.floor(diffDays / 30) + 1;
      } else if (freq === 'quarterly') {
        occurrences = Math.floor(diffDays / 90) + 1;
      } else if (freq === 'biannual') {
        occurrences = Math.floor(diffDays / 180) + 1;
      }

      const amount = r.amount || 0;
      const sign = r.type === 'expense' ? 1 : -1;
      return acc + (occurrences * amount * sign);
    }, 0);

    return base - projectImpact; // subtract expenses, add incomes
  }, [trips, transactions, recurringTransactions]);

  // Confirm a due occurrence: creates a normal transaction and updates lastAppliedDate
  const confirmRecurringOccurrence = useCallback(async (recurring) => {
    if (!userId) throw new Error('User not authenticated');

    // Create effective transaction mirroring the recurring
    await addTransactionService(userId, {
      tripId: recurring.tripId,
      amount: recurring.amount,
      description: recurring.description || `${recurring.frequency} recorrente`,
      type: recurring.type,
      categoryId: recurring.categoryId || null,
      categoryName: recurring.categoryName,
      currency: recurring.currency,
      date: new Date(),
    });

    // Update recurring last applied date
    await updateRecurringTransaction(userId, recurring.id, { lastAppliedDate: new Date() });
  }, [userId]);

  const value = {
    // Data
    trips,
    transactions,
    recurringTransactions,
    categories,
    loading,
    
    // Helper functions
    getActiveTrip,
    getTripTransactions,
    getTripBalance,
    getTripByCategory,
    getCategoryById,
    getProjectedBalance,
    
    // Trip management
    createTrip,
    updateTrip,
    deleteTrip,
    activateTrip,
    
    // Transaction management
    addTransaction,
    addRecurringTransaction,
    updateTransaction,
    deleteTransaction,

    // Recurring confirmation
    confirmRecurringOccurrence,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
