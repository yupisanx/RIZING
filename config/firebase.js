import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCwENcZfC_XtMdlahGA_EIQLwkKjBK_ST4",
  authDomain: "ari-e1552.firebaseapp.com",
  projectId: "ari-e1552",
  storageBucket: "ari-e1552.appspot.com",
  messagingSenderId: "298096239214",
  appId: "1:298096239214:web:7507811960cfea397b3c7f",
  measurementId: "G-E6ET7JRSYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

// Initialize Storage with explicit bucket URL
let storage;
try {
  storage = getStorage(app);
  console.log('Firebase Storage initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Storage:', error);
  // Fallback initialization
  storage = getStorage(app, "gs://ari-e1552.appspot.com");
}

const analytics = getAnalytics(app);

export { auth, db, storage, analytics }; 