import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

const MedicationContext = createContext({});

export const useMedicationContext = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedicationContext must be used within a MedicationProvider');
  }
  return context;
};

// Backward compatibility
export const useMedication = useMedicationContext;

export const MedicationProvider = ({ children }) => {
  const { userId } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to medications
  useEffect(() => {
    if (!userId) {
      setMedications([]);
      setLoading(false);
      return;
    }

    try {
      const medicationsRef = collection(db, 'users', userId, 'medications');
      const q = query(
        medicationsRef, 
        orderBy('name')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const medicationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setMedications(medicationsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error in medications subscription:', error);
          setMedications([]);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up medications subscription:', error);
      setMedications([]);
      setLoading(false);
    }
  }, [userId]);

  // Get active medications (with notifications enabled)
  const activeMedications = medications.filter(med => med.isActive);

  // Get medications due soon (next 2 hours)
  const medicationsDueSoon = activeMedications.filter(med => {
    if (!med.nextAlarm) return false;
    const nextAlarm = med.nextAlarm.toDate ? med.nextAlarm.toDate() : new Date(med.nextAlarm);
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return nextAlarm <= twoHoursFromNow && nextAlarm > now;
  });

  const value = {
    medications,
    activeMedications,
    medicationsDueSoon,
    loading,
    
    // Helper functions
    refreshData: () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  };

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
};
