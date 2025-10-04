import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { tripService } from '../services/tripService';

const TripContext = createContext({});

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [outcomeCategories, setOutcomeCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to trips when user changes
  useEffect(() => {
    if (!user) {
      setTrips([]);
      setIncomes([]);
      setOutcomes([]);
      setRecurringTransactions([]);
      return;
    }

    const unsubscribe = tripService.subscribeToTrips(user.uid, (tripsData) => {
      setTrips(tripsData);
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to active trip data
  useEffect(() => {
    if (!user) return;

    const activeTrip = getActiveTrip();
    if (!activeTrip) {
      setIncomes([]);
      setOutcomes([]);
      setRecurringTransactions([]);
      return;
    }

    // Subscribe to incomes
    const unsubscribeIncomes = tripService.subscribeToIncomes(
      user.uid, 
      activeTrip.id, 
      setIncomes
    );

    // Subscribe to outcomes
    const unsubscribeOutcomes = tripService.subscribeToOutcomes(
      user.uid, 
      activeTrip.id, 
      setOutcomes
    );

    // Subscribe to recurring transactions
    const unsubscribeRecurring = tripService.subscribeToRecurringTransactions(
      user.uid, 
      activeTrip.id, 
      setRecurringTransactions
    );

    // Load categories
    loadCategories(activeTrip.id);

    return () => {
      unsubscribeIncomes();
      unsubscribeOutcomes();
      unsubscribeRecurring();
    };
  }, [user, trips]);

  // Load categories
  const loadCategories = async (tripId) => {
    if (!user) return;

    try {
      const [incomeResult, outcomeResult] = await Promise.all([
        tripService.getIncomeCategories(user.uid, tripId),
        tripService.getOutcomeCategories(user.uid, tripId)
      ]);

      if (incomeResult.success) {
        setIncomeCategories(incomeResult.categories);
      }
      if (outcomeResult.success) {
        setOutcomeCategories(outcomeResult.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // TRIP MANAGEMENT

  const createTrip = async (tripData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.createTrip(user.uid, tripData);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (tripId, updates) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.updateTrip(user.uid, tripId, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.deleteTrip(user.uid, tripId);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const activateTrip = async (tripId) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.activateTrip(user.uid, tripId);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // TRANSACTION MANAGEMENT

  const addIncome = async (incomeData) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.addIncome(user.uid, activeTrip.id, incomeData);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addOutcome = async (outcomeData) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.addOutcome(user.uid, activeTrip.id, outcomeData);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (transactionId, updates, type) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (type === 'income') {
        result = await tripService.updateIncome(user.uid, activeTrip.id, transactionId, updates);
      } else {
        result = await tripService.updateOutcome(user.uid, activeTrip.id, transactionId, updates);
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId, type) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (type === 'income') {
        result = await tripService.deleteIncome(user.uid, activeTrip.id, transactionId);
      } else {
        result = await tripService.deleteOutcome(user.uid, activeTrip.id, transactionId);
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // RECURRING TRANSACTIONS

  const addRecurringTransaction = async (recurringData) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.addRecurringTransaction(user.uid, activeTrip.id, recurringData);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecurringTransaction = async (recurringId) => {
    if (!user) throw new Error('User not authenticated');
    
    const activeTrip = getActiveTrip();
    if (!activeTrip) throw new Error('No active trip found');

    try {
      setLoading(true);
      setError(null);
      
      const result = await tripService.deleteRecurringTransaction(user.uid, activeTrip.id, recurringId);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // HELPER FUNCTIONS

  const getActiveTrip = () => {
    return trips.find(trip => trip.isActive) || null;
  };

  const getTripTransactions = (tripId) => {
    const activeTrip = getActiveTrip();
    if (!activeTrip || activeTrip.id !== tripId) return [];
    
    return [...incomes, ...outcomes].sort((a, b) => {
      const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return bDate - aDate;
    });
  };

  const getTripBalance = (tripId = null) => {
    const trip = tripId ? trips.find(t => t.id === tripId) : getActiveTrip();
    if (!trip) return 0;

    const activeTrip = getActiveTrip();
    if (!activeTrip || (tripId && activeTrip.id !== tripId)) return 0;

    const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    const totalOutcome = outcomes.reduce((sum, outcome) => sum + (outcome.amount || 0), 0);
    
    return (trip.initialBudget || 0) + totalIncome - totalOutcome;
  };

  const getProjectedBalance = (tripId = null) => {
    const currentBalance = getTripBalance(tripId);
    const trip = tripId ? trips.find(t => t.id === tripId) : getActiveTrip();
    if (!trip) return currentBalance;

    // Calculate impact of future recurring transactions
    const now = new Date();
    const tripEndDate = trip.endDate?.toDate ? trip.endDate.toDate() : new Date(trip.endDate);
    
    let projectedImpact = 0;
    
    recurringTransactions.forEach(recurring => {
      if (!recurring.startDate || !recurring.endDate) return;
      
      const startDate = recurring.startDate.toDate ? recurring.startDate.toDate() : new Date(recurring.startDate);
      const endDate = recurring.endDate.toDate ? recurring.endDate.toDate() : new Date(recurring.endDate);
      
      if (startDate <= tripEndDate && endDate >= now) {
        // Simple calculation - could be more sophisticated
        const daysRemaining = Math.max(0, (Math.min(tripEndDate, endDate) - now) / (1000 * 60 * 60 * 24));
        let occurrences = 0;
        
        switch (recurring.frequency) {
          case 'daily':
            occurrences = Math.floor(daysRemaining);
            break;
          case 'weekly':
            occurrences = Math.floor(daysRemaining / 7);
            break;
          case 'monthly':
            occurrences = Math.floor(daysRemaining / 30);
            break;
          case 'quarterly':
            occurrences = Math.floor(daysRemaining / 90);
            break;
          case 'biannual':
            occurrences = Math.floor(daysRemaining / 180);
            break;
        }
        
        const impact = occurrences * (recurring.amount || 0);
        if (recurring.type === 'income') {
          projectedImpact += impact;
        } else {
          projectedImpact -= impact;
        }
      }
    });
    
    return currentBalance + projectedImpact;
  };

  const getCategoryById = (categoryId, type = 'outcome') => {
    const categories = type === 'income' ? incomeCategories : outcomeCategories;
    return categories.find(cat => cat.id === categoryId) || null;
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    trips,
    incomes,
    outcomes,
    recurringTransactions,
    incomeCategories,
    outcomeCategories,
    loading,
    error,
    
    // Trip management
    createTrip,
    updateTrip,
    deleteTrip,
    activateTrip,
    
    // Transaction management
    addIncome,
    addOutcome,
    updateTransaction,
    deleteTransaction,
    
    // Recurring transactions
    addRecurringTransaction,
    deleteRecurringTransaction,
    
    // Helper functions
    getActiveTrip,
    getTripTransactions,
    getTripBalance,
    getProjectedBalance,
    getCategoryById,
    clearError,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export default TripContext;
