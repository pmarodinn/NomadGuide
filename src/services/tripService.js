import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Trip Management
export const createTrip = async (userId, tripData) => {
  try {
    const tripsRef = collection(db, 'users', userId, 'trips');
    const docRef = await addDoc(tripsRef, {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: false
    });
    console.log('✅ Trip created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating trip:', error);
    throw error;
  }
};

export const updateTrip = async (userId, tripId, updates) => {
  try {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Trip updated successfully');
  } catch (error) {
    console.error('❌ Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (userId, tripId) => {
  try {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(tripRef);
    console.log('✅ Trip deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting trip:', error);
    throw error;
  }
};

export const activateTrip = async (tripId, userId) => {
  try {
    // First, deactivate all other trips for this user
    const tripsQuery = query(
      collection(db, 'users', userId, 'trips'),
      where('isActive', '==', true)
    );

    // We need to get the trips first, then update them
    const unsubscribe = onSnapshot(tripsQuery, async (snapshot) => {
      const batch = [];
      snapshot.forEach((doc) => {
        if (doc.id !== tripId) {
          batch.push(updateDoc(doc.ref, { isActive: false, updatedAt: serverTimestamp() }));
        }
      });
      
      // Wait for all deactivations to complete
      await Promise.all(batch);
      
      // Now activate the selected trip
      await updateTrip(userId, tripId, { isActive: true });
      
      // Unsubscribe immediately as this is a one-time operation
      unsubscribe();
    });
  } catch (error) {
    console.error('Erro ao ativar viagem:', error);
    throw error;
  }
};

// Transaction Management
export const addTransaction = async (userId, transactionData) => {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Convert date to Firestore Timestamp if it's a regular Date
      date: transactionData.date instanceof Date ? 
        Timestamp.fromDate(transactionData.date) : 
        transactionData.date
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};

export const addRecurringTransaction = async (userId, recurringTransactionData) => {
  try {
    const recurringTransactionsRef = collection(db, 'users', userId, 'recurringTransactions');
    const docRef = await addDoc(recurringTransactionsRef, {
      ...recurringTransactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Convert dates to Firestore Timestamps if they're regular Dates
      startDate: recurringTransactionData.startDate instanceof Date ? 
        Timestamp.fromDate(recurringTransactionData.startDate) : 
        recurringTransactionData.startDate,
      endDate: recurringTransactionData.endDate instanceof Date ? 
        Timestamp.fromDate(recurringTransactionData.endDate) : 
        recurringTransactionData.endDate
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar transação recorrente:', error);
    throw error;
  }
};

export const updateTransaction = async (userId, transactionId, updates) => {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      // Convert date to Firestore Timestamp if it's a regular Date
      ...(updates.date instanceof Date && {
        date: Timestamp.fromDate(updates.date)
      })
    });
    console.log('✅ Transaction updated successfully');
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (userId, transactionId) => {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionRef);
    console.log('✅ Transaction deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    throw error;
  }
};

// Category Management
export const createCategory = async (userId, categoryData) => {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesRef, {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const updateCategory = async (userId, categoryId, updates) => {
  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Category updated successfully');
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (userId, categoryId) => {
  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('✅ Category deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToTrips = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'trips'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const trips = [];
        snapshot.forEach((doc) => {
          trips.push({ id: doc.id, ...doc.data() });
        });
        callback(trips);
      },
      (error) => {
        console.error('Error in trips subscription:', error);
        // Return empty array on error
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up trips subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

export const subscribeToTransactions = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
        callback(transactions);
      },
      (error) => {
        console.error('Error in transactions subscription:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up transactions subscription:', error);
    callback([]);
    return () => {};
  }
};

export const subscribeToCategories = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'categories'),
      orderBy('name', 'asc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const categories = [];
        snapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() });
        });
        callback(categories);
      },
      (error) => {
        console.error('Error in categories subscription:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up categories subscription:', error);
    callback([]);
    return () => {};
  }
};

// Helper function to initialize default categories for a new user
export const initializeDefaultCategories = async (userId) => {
  const defaultCategories = [
    { name: 'Alimentação', icon: '🍽️', color: '#FF5722' },
    { name: 'Transporte', icon: '🚗', color: '#2196F3' },
    { name: 'Hospedagem', icon: '🏨', color: '#9C27B0' },
    { name: 'Entretenimento', icon: '🎉', color: '#FF9800' },
    { name: 'Compras', icon: '🛍️', color: '#E91E63' },
    { name: 'Saúde', icon: '💊', color: '#4CAF50' },
    { name: 'Outros', icon: '📝', color: '#607D8B' }
  ];

  try {
    const promises = defaultCategories.map(category => 
      createCategory(userId, category)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao inicializar categorias padrão:', error);
    throw error;
  }
};
