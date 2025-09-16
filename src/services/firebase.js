import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// ==================== TRIPS ====================

/**
 * Create a new trip
 * @param {string} userId - User ID
 * @param {Object} tripData - Trip data
 * @returns {Promise<string>} - Created trip ID
 */
export const createTrip = async (userId, tripData) => {
  try {
    const tripsRef = collection(db, 'users', userId, 'trips');
    
    // Deactivate other trips first
    if (tripData.isActive) {
      await deactivateAllTrips(userId);
    }
    
    const docRef = await addDoc(tripsRef, {
      ...tripData,
      createdAt: Timestamp.now(),
    });
    
    console.log('✅ Trip created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating trip:', error);
    throw error;
  }
};

/**
 * Update a trip
 * @param {string} userId - User ID
 * @param {string} tripId - Trip ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateTrip = async (userId, tripId, updateData) => {
  try {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    
    // If setting as active, deactivate others first
    if (updateData.isActive) {
      await deactivateAllTrips(userId);
    }
    
    await updateDoc(tripRef, updateData);
    console.log('✅ Trip updated successfully');
  } catch (error) {
    console.error('❌ Error updating trip:', error);
    throw error;
  }
};

/**
 * Delete a trip and all its related data
 * @param {string} userId - User ID
 * @param {string} tripId - Trip ID
 * @returns {Promise<void>}
 */
export const deleteTrip = async (userId, tripId) => {
  try {
    // Delete all transactions for this trip
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const transactionsQuery = query(transactionsRef, where('tripId', '==', tripId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    const transactionDeletePromises = transactionsSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(transactionDeletePromises);
    
    // Delete all recurrences for this trip
    const recurrencesRef = collection(db, 'users', userId, 'recurrences');
    const recurrencesQuery = query(recurrencesRef, where('tripId', '==', tripId));
    const recurrencesSnapshot = await getDocs(recurrencesQuery);
    
    const recurrenceDeletePromises = recurrencesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(recurrenceDeletePromises);
    
    // Finally delete the trip
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(tripRef);
    
    console.log('✅ Trip and related data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting trip:', error);
    throw error;
  }
};

/**
 * Deactivate all trips for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deactivateAllTrips = async (userId) => {
  try {
    const tripsRef = collection(db, 'users', userId, 'trips');
    const activeTripsQuery = query(tripsRef, where('isActive', '==', true));
    const snapshot = await getDocs(activeTripsQuery);
    
    const promises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { isActive: false })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('❌ Error deactivating trips:', error);
    throw error;
  }
};

// ==================== TRANSACTIONS ====================

/**
 * Create a new transaction
 * @param {string} userId - User ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<string>} - Created transaction ID
 */
export const createTransaction = async (userId, transactionData) => {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      date: transactionData.date || Timestamp.now(),
    });
    
    console.log('✅ Transaction created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update a transaction
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateTransaction = async (userId, transactionId, updateData) => {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(transactionRef, updateData);
    console.log('✅ Transaction updated successfully');
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    throw error;
  }
};

/**
 * Delete a transaction
 * @param {string} userId - User ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<void>}
 */
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

// ==================== RECURRENCES ====================

/**
 * Create a new recurrence
 * @param {string} userId - User ID
 * @param {Object} recurrenceData - Recurrence data
 * @returns {Promise<string>} - Created recurrence ID
 */
export const createRecurrence = async (userId, recurrenceData) => {
  try {
    const recurrencesRef = collection(db, 'users', userId, 'recurrences');
    const docRef = await addDoc(recurrencesRef, {
      ...recurrenceData,
      nextDate: recurrenceData.startDate, // Initially, next date = start date
    });
    
    console.log('✅ Recurrence created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating recurrence:', error);
    throw error;
  }
};

/**
 * Update a recurrence
 * @param {string} userId - User ID
 * @param {string} recurrenceId - Recurrence ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateRecurrence = async (userId, recurrenceId, updateData) => {
  try {
    const recurrenceRef = doc(db, 'users', userId, 'recurrences', recurrenceId);
    await updateDoc(recurrenceRef, updateData);
    console.log('✅ Recurrence updated successfully');
  } catch (error) {
    console.error('❌ Error updating recurrence:', error);
    throw error;
  }
};

/**
 * Delete a recurrence
 * @param {string} userId - User ID
 * @param {string} recurrenceId - Recurrence ID
 * @returns {Promise<void>}
 */
export const deleteRecurrence = async (userId, recurrenceId) => {
  try {
    const recurrenceRef = doc(db, 'users', userId, 'recurrences', recurrenceId);
    await deleteDoc(recurrenceRef);
    console.log('✅ Recurrence deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting recurrence:', error);
    throw error;
  }
};

// ==================== MEDICATIONS ====================

/**
 * Create a new medication
 * @param {string} userId - User ID
 * @param {Object} medicationData - Medication data
 * @returns {Promise<string>} - Created medication ID
 */
export const createMedication = async (userId, medicationData) => {
  try {
    const medicationsRef = collection(db, 'users', userId, 'medications');
    const docRef = await addDoc(medicationsRef, medicationData);
    
    console.log('✅ Medication created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating medication:', error);
    throw error;
  }
};

/**
 * Update a medication
 * @param {string} userId - User ID
 * @param {string} medicationId - Medication ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateMedication = async (userId, medicationId, updateData) => {
  try {
    const medicationRef = doc(db, 'users', userId, 'medications', medicationId);
    await updateDoc(medicationRef, updateData);
    console.log('✅ Medication updated successfully');
  } catch (error) {
    console.error('❌ Error updating medication:', error);
    throw error;
  }
};

/**
 * Delete a medication
 * @param {string} userId - User ID
 * @param {string} medicationId - Medication ID
 * @returns {Promise<void>}
 */
export const deleteMedication = async (userId, medicationId) => {
  try {
    const medicationRef = doc(db, 'users', userId, 'medications', medicationId);
    await deleteDoc(medicationRef);
    console.log('✅ Medication deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting medication:', error);
    throw error;
  }
};

/**
 * Mark medication as taken and update next alarm
 * @param {string} userId - User ID
 * @param {string} medicationId - Medication ID
 * @param {Date} nextAlarm - Next alarm time
 * @returns {Promise<void>}
 */
export const markMedicationTaken = async (userId, medicationId, nextAlarm) => {
  try {
    const medicationRef = doc(db, 'users', userId, 'medications', medicationId);
    await updateDoc(medicationRef, {
      lastTaken: Timestamp.now(),
      nextAlarm: Timestamp.fromDate(nextAlarm),
    });
    console.log('✅ Medication marked as taken');
  } catch (error) {
    console.error('❌ Error marking medication as taken:', error);
    throw error;
  }
};
