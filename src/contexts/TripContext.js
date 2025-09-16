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
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  initializeDefaultCategories
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

  const value = {
    // Data
    trips,
    transactions,
    categories,
    loading,
    
    // Helper functions
    getActiveTrip,
    getTripTransactions,
    getTripBalance,
    getTripByCategory,
    getCategoryById,
    
    // Trip management
    createTrip,
    updateTrip,
    deleteTrip,
    activateTrip,
    
    // Transaction management
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
