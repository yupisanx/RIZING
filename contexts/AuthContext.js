import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Function to sync user data to local storage
  const syncUserDataToStorage = async (userData) => {
    try {
      await AsyncStorage.setItem('@onboarding_data', JSON.stringify({
        gender: userData.gender,
        avatarId: userData.avatarId,
        class: userData.class,
        rank: userData.rank,
        environment: userData.environment,
        trainingDays: userData.trainingDays,
        focusArea: userData.focusArea,
        hasCompletedOnboarding: userData.hasCompletedOnboarding
      }));
    } catch (error) {
      console.error('Error syncing user data to storage:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          // Check if user has completed onboarding
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const hasCompletedOnboarding = userData.hasCompletedOnboarding === true;
            
            if (hasCompletedOnboarding) {
              // Sync completed user data to local storage
              await syncUserDataToStorage(userData);
            }
            
            setHasCompletedOnboarding(hasCompletedOnboarding);
          } else {
            // Create new user document with initial data
            const initialUserData = {
              username: user.displayName || 'test_user',
              email: user.email,
              createdAt: serverTimestamp(),
              isFirstTime: true,
              hasCompletedOnboarding: false,
              lastUpdated: serverTimestamp()
            };
            
            await setDoc(doc(db, 'users', user.uid), initialUserData);
            setHasCompletedOnboarding(false);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          setHasCompletedOnboarding(false);
        }
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
        // Clear local storage on logout
        await AsyncStorage.removeItem('@onboarding_data');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with username
      await updateProfile(user, {
        displayName: username
      });
      
      // Create initial user document
      const initialUserData = {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
        isFirstTime: true,
        hasCompletedOnboarding: false,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), initialUserData);
      setHasCompletedOnboarding(false);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check onboarding status
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasCompletedOnboarding = userData.hasCompletedOnboarding === true;
        
        if (hasCompletedOnboarding) {
          await syncUserDataToStorage(userData);
        }
        
        setHasCompletedOnboarding(hasCompletedOnboarding);
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local storage on logout
      await AsyncStorage.removeItem('@onboarding_data');
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    hasCompletedOnboarding,
    setHasCompletedOnboarding: (value) => {
      console.log('Setting hasCompletedOnboarding to:', value);
      setHasCompletedOnboarding(value);
    },
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 