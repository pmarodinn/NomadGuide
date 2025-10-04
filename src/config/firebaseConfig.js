import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_IVGhFgR5AwyyYEi6lYiLOZtd8fFjrEg",
  authDomain: "nomadguide-5ea09.firebaseapp.com",
  projectId: "nomadguide-5ea09",
  storageBucket: "nomadguide-5ea09.firebasestorage.app",
  messagingSenderId: "1053963071181",
  appId: "1:1053963071181:android:207a38563eb737d9640384"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
