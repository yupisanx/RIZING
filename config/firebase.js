import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBYKkSjYeJ6WxXBQyrH0okUUB_W98v8LI",
  authDomain: "slx2-d3ffa.firebaseapp.com",
  projectId: "slx2-d3ffa",
  storageBucket: "slx2-d3ffa.firebasestorage.app",
  messagingSenderId: "63376083936",
  appId: "1:63376083936:web:789aca1c600a4fa7e07985",
  measurementId: "G-3DDNSNBRVC"
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