import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvpGGJC8b9ypfHqZ9FGGj8XA4SRQ1SUS0",
  authDomain: "sololeveling-2e9fd.firebaseapp.com",
  projectId: "sololeveling-2e9fd",
  storageBucket: "sololeveling-2e9fd.firebasestorage.app",
  messagingSenderId: "259118497281",
  appId: "1:259118497281:web:8a216d0451fc3786ad4a00",
  measurementId: "G-2E0NSRKG2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db }; 