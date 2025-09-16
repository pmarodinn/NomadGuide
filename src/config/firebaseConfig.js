import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - Your real project credentials
const firebaseConfig = {
  apiKey: "AIzaSyC_IVGhFgR5AwyyYEi6lYiLOZtd8fFjrEg",
  authDomain: "nomadguide-5ea09.firebaseapp.com",
  projectId: "nomadguide-5ea09",
  storageBucket: "nomadguide-5ea09.appspot.com",
  messagingSenderId: "1053963071181",
  appId: "1:1053963071181:android:207a38563eb737d9640384"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firebase Auth functions for email/password authentication
// No automatic login - user will authenticate through login screen

export { db, auth };
