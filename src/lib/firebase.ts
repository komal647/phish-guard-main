import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDRSAibWjDOca2punF2fLshvMK-TCTVDqA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "phishguard7-15533.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "phishguard7-15533",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "phishguard7-15533.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "284819633838",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:284819633838:web:436a14ef2c10d4e8501f3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
