import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDemo-NomadApp-Config-Key-Replace-This",
  authDomain: "nomadapp-demo.firebaseapp.com",
  projectId: "nomadapp-demo",
  storageBucket: "nomadapp-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Automatic anonymous login
signInAnonymously(auth)
  .then(() => {
    console.log("✅ Anonymous user logged in successfully");
  })
  .catch((error) => {
    console.error("❌ Anonymous login error:", error);
  });

export { db, auth };
