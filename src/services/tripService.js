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
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    throw error;
  }
};

export const updateTrip = async (tripId, updates) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar viagem:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    throw error;
  }
};

export const activateTrip = async (tripId, userId) => {
  try {
    // First, deactivate all other trips for this user
    const tripsQuery = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
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
      await updateTrip(tripId, { isActive: true });
      
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
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId,
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

export const updateTransaction = async (transactionId, updates) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      // Convert date to Firestore Timestamp if it's a regular Date
      ...(updates.date instanceof Date && {
        date: Timestamp.fromDate(updates.date)
      })
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
};

// Category Management
export const createCategory = async (userId, categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, updates) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToTrips = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
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
      collection(db, 'transactions'),
      where('userId', '==', userId),
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
      collection(db, 'categories'),
      where('userId', '==', userId),
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
