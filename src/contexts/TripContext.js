import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';
import { calculateRealBalance, calculateProjectedBalance } from '../utils/balanceUtils';

const TripContext = createContext({});

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const { userId } = useAuth();
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recurrences, setRecurrences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to trips
  useEffect(() => {
    if (!userId) return;

    const tripsRef = collection(db, 'users', userId, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTrips(tripsData);
      
      // Find active trip
      const active = tripsData.find(trip => trip.isActive);
      setActiveTrip(active || null);
      
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Listen to transactions for active trip
  useEffect(() => {
    if (!userId || !activeTrip) {
      setTransactions([]);
      return;
    }

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(
      transactionsRef, 
      where('tripId', '==', activeTrip.id),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsData);
    });

    return unsubscribe;
  }, [userId, activeTrip]);

  // Listen to recurrences for active trip
  useEffect(() => {
    if (!userId || !activeTrip) {
      setRecurrences([]);
      return;
    }

    const recurrencesRef = collection(db, 'users', userId, 'recurrences');
    const q = query(
      recurrencesRef, 
      where('tripId', '==', activeTrip.id),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recurrencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecurrences(recurrencesData);
    });

    return unsubscribe;
  }, [userId, activeTrip]);

  // Calculate balances
  const realBalance = useCallback(() => {
    if (!activeTrip) return 0;
    return calculateRealBalance(activeTrip, transactions);
  }, [activeTrip, transactions]);

  const projectedBalance = useCallback(() => {
    if (!activeTrip) return 0;
    return calculateProjectedBalance(activeTrip, transactions, recurrences);
  }, [activeTrip, transactions, recurrences]);

  const value = {
    // Data
    trips,
    activeTrip,
    transactions,
    recurrences,
    loading,
    
    // Calculated values
    realBalance: realBalance(),
    projectedBalance: projectedBalance(),
    
    // Helper functions
    refreshData: () => {
      // This will be called to trigger recalculations
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
