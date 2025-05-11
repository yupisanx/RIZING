import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCwENcZfC_XtMdlahGA_EIQLwkKjBK_ST4",
  authDomain: "ari-e1552.firebaseapp.com",
  projectId: "ari-e1552",
  storageBucket: "ari-e1552.firebasestorage.app",
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
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics }; 