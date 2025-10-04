import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const tripService = {
  // TRIP MANAGEMENT
  
  // Create new trip
  createTrip: async (userId, tripData) => {
    try {
      const tripsRef = collection(db, 'users', userId, 'trips');
      const tripDoc = await addDoc(tripsRef, {
        ...tripData,
        isActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Initialize default categories for the trip
      await tripService.initializeDefaultCategories(userId, tripDoc.id);
      
      return { success: true, tripId: tripDoc.id };
    } catch (error) {
      console.error('Error creating trip:', error);
      return { success: false, error: error.message };
    }
  },

  // Update trip
  updateTrip: async (userId, tripId, updates) => {
    try {
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating trip:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete trip
  deleteTrip: async (userId, tripId) => {
    try {
      const batch = writeBatch(db);
      
      // Delete all subcollections first
      const subcollections = ['incomes', 'outcomes', 'medications', 'recurringTransactions'];
      
      for (const subcollection of subcollections) {
        const subRef = collection(db, 'users', userId, 'trips', tripId, subcollection);
        const subDocs = await getDocs(subRef);
        subDocs.forEach((subDoc) => {
          batch.delete(subDoc.ref);
        });
      }
      
      // Delete the trip document
      const tripRef = doc(db, 'users', userId, 'trips', tripId);
      batch.delete(tripRef);
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error deleting trip:', error);
      return { success: false, error: error.message };
    }
  },

  // Activate trip
  activateTrip: async (userId, tripId) => {
    try {
      const batch = writeBatch(db);
      
      // Deactivate all trips
      const tripsRef = collection(db, 'users', userId, 'trips');
      const tripsSnapshot = await getDocs(tripsRef);
      tripsSnapshot.forEach((tripDoc) => {
        batch.update(tripDoc.ref, { isActive: false });
      });
      
      // Activate the selected trip
      const activeTripRef = doc(db, 'users', userId, 'trips', tripId);
      batch.update(activeTripRef, { 
        isActive: true,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error activating trip:', error);
      return { success: false, error: error.message };
    }
  },

  // INCOME MANAGEMENT

  // Add income
  addIncome: async (userId, tripId, incomeData) => {
    try {
      const incomesRef = collection(db, 'users', userId, 'trips', tripId, 'incomes');
      const incomeDoc = await addDoc(incomesRef, {
        ...incomeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, incomeId: incomeDoc.id };
    } catch (error) {
      console.error('Error adding income:', error);
      return { success: false, error: error.message };
    }
  },

  // Update income
  updateIncome: async (userId, tripId, incomeId, updates) => {
    try {
      const incomeRef = doc(db, 'users', userId, 'trips', tripId, 'incomes', incomeId);
      await updateDoc(incomeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating income:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete income
  deleteIncome: async (userId, tripId, incomeId) => {
    try {
      const incomeRef = doc(db, 'users', userId, 'trips', tripId, 'incomes', incomeId);
      await deleteDoc(incomeRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting income:', error);
      return { success: false, error: error.message };
    }
  },

  // OUTCOME MANAGEMENT

  // Add outcome
  addOutcome: async (userId, tripId, outcomeData) => {
    try {
      const outcomesRef = collection(db, 'users', userId, 'trips', tripId, 'outcomes');
      const outcomeDoc = await addDoc(outcomesRef, {
        ...outcomeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, outcomeId: outcomeDoc.id };
    } catch (error) {
      console.error('Error adding outcome:', error);
      return { success: false, error: error.message };
    }
  },

  // Update outcome
  updateOutcome: async (userId, tripId, outcomeId, updates) => {
    try {
      const outcomeRef = doc(db, 'users', userId, 'trips', tripId, 'outcomes', outcomeId);
      await updateDoc(outcomeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating outcome:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete outcome
  deleteOutcome: async (userId, tripId, outcomeId) => {
    try {
      const outcomeRef = doc(db, 'users', userId, 'trips', tripId, 'outcomes', outcomeId);
      await deleteDoc(outcomeRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting outcome:', error);
      return { success: false, error: error.message };
    }
  },

  // RECURRING TRANSACTIONS

  // Add recurring transaction
  addRecurringTransaction: async (userId, tripId, data) => {
    try {
      const recurringRef = collection(db, 'users', userId, 'trips', tripId, 'recurringTransactions');
      const recurringDoc = await addDoc(recurringRef, {
        ...data,
        lastAppliedDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, recurringId: recurringDoc.id };
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Update recurring transaction
  updateRecurringTransaction: async (userId, tripId, recurringId, updates) => {
    try {
      const recurringRef = doc(db, 'users', userId, 'trips', tripId, 'recurringTransactions', recurringId);
      await updateDoc(recurringRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete recurring transaction
  deleteRecurringTransaction: async (userId, tripId, recurringId) => {
    try {
      const recurringRef = doc(db, 'users', userId, 'trips', tripId, 'recurringTransactions', recurringId);
      await deleteDoc(recurringRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      return { success: false, error: error.message };
    }
  },

  // MEDICATION MANAGEMENT

  // Add medication
  addMedication: async (userId, tripId, medicationData) => {
    try {
      const medicationsRef = collection(db, 'users', userId, 'trips', tripId, 'medications');
      const medicationDoc = await addDoc(medicationsRef, {
        ...medicationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, medicationId: medicationDoc.id };
    } catch (error) {
      console.error('Error adding medication:', error);
      return { success: false, error: error.message };
    }
  },

  // Update medication
  updateMedication: async (userId, tripId, medicationId, updates) => {
    try {
      const medicationRef = doc(db, 'users', userId, 'trips', tripId, 'medications', medicationId);
      await updateDoc(medicationRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating medication:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete medication
  deleteMedication: async (userId, tripId, medicationId) => {
    try {
      const medicationRef = doc(db, 'users', userId, 'trips', tripId, 'medications', medicationId);
      await deleteDoc(medicationRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting medication:', error);
      return { success: false, error: error.message };
    }
  },

  // REAL-TIME SUBSCRIPTIONS

  // Subscribe to trips
  subscribeToTrips: (userId, callback) => {
    const tripsRef = collection(db, 'users', userId, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(trips);
    });
  },

  // Subscribe to incomes
  subscribeToIncomes: (userId, tripId, callback) => {
    const incomesRef = collection(db, 'users', userId, 'trips', tripId, 'incomes');
    const q = query(incomesRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const incomes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(incomes);
    });
  },

  // Subscribe to outcomes
  subscribeToOutcomes: (userId, tripId, callback) => {
    const outcomesRef = collection(db, 'users', userId, 'trips', tripId, 'outcomes');
    const q = query(outcomesRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const outcomes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(outcomes);
    });
  },

  // Subscribe to recurring transactions
  subscribeToRecurringTransactions: (userId, tripId, callback) => {
    const recurringRef = collection(db, 'users', userId, 'trips', tripId, 'recurringTransactions');
    const q = query(recurringRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const recurring = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(recurring);
    });
  },

  // Subscribe to medications
  subscribeToMedications: (userId, tripId, callback) => {
    const medicationsRef = collection(db, 'users', userId, 'trips', tripId, 'medications');
    const q = query(medicationsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const medications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(medications);
    });
  },

  // HELPER FUNCTIONS

  // Initialize default categories
  initializeDefaultCategories: async (userId, tripId) => {
    try {
      const batch = writeBatch(db);
      
      // Default income categories
      const incomeCategories = [
        { name: 'Salary', icon: 'account-cash', color: '#4CAF50' },
        { name: 'Bonus', icon: 'gift', color: '#FF9800' },
        { name: 'Investment', icon: 'trending-up', color: '#2196F3' },
        { name: 'Other Income', icon: 'cash-plus', color: '#9C27B0' },
      ];

      // Default outcome categories
      const outcomeCategories = [
        { name: 'Food & Dining', icon: 'food', color: '#FF5722' },
        { name: 'Transportation', icon: 'car', color: '#607D8B' },
        { name: 'Accommodation', icon: 'bed', color: '#795548' },
        { name: 'Entertainment', icon: 'movie', color: '#E91E63' },
        { name: 'Shopping', icon: 'shopping', color: '#9C27B0' },
        { name: 'Health & Medical', icon: 'medical-bag', color: '#009688' },
        { name: 'Other Expenses', icon: 'cash-minus', color: '#757575' },
      ];

      // Add income categories
      incomeCategories.forEach((category) => {
        const categoryRef = doc(collection(db, 'users', userId, 'trips', tripId, 'incomeCategories'));
        batch.set(categoryRef, {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      // Add outcome categories  
      outcomeCategories.forEach((category) => {
        const categoryRef = doc(collection(db, 'users', userId, 'trips', tripId, 'outcomeCategories'));
        batch.set(categoryRef, {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error initializing categories:', error);
      return { success: false, error: error.message };
    }
  },

  // Get categories
  getIncomeCategories: async (userId, tripId) => {
    try {
      const categoriesRef = collection(db, 'users', userId, 'trips', tripId, 'incomeCategories');
      const snapshot = await getDocs(categoriesRef);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, categories };
    } catch (error) {
      console.error('Error getting income categories:', error);
      return { success: false, error: error.message };
    }
  },

  getOutcomeCategories: async (userId, tripId) => {
    try {
      const categoriesRef = collection(db, 'users', userId, 'trips', tripId, 'outcomeCategories');
      const snapshot = await getDocs(categoriesRef);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, categories };
    } catch (error) {
      console.error('Error getting outcome categories:', error);
      return { success: false, error: error.message };
    }
  },
};

export default tripService;
