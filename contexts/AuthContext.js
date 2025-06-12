import React, { createContext, useContext, useState, useEffect } from 'react';
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

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (user) {
        setLoading(true); // Set loading when auth state changes
        try {
          // Try to get user data from AsyncStorage first
          const cachedData = await AsyncStorage.getItem('@user_data');
          if (cachedData) {
            const userData = JSON.parse(cachedData);
            setHasCompletedOnboarding(userData.hasCompletedOnboarding || false);
          }

          // Then fetch fresh data from Firebase
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
            setHasCompletedOnboarding(userData.hasCompletedOnboarding || false);
          }
          setUser(user);
        } catch (error) {
          console.error('Error syncing user data:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
        await AsyncStorage.removeItem('@user_data');
        if (isMounted) {
      setLoading(false);
        }
      }
      if (isMounted) {
        setIsInitialized(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true); // Set loading immediately
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Cache the data
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        setHasCompletedOnboarding(userData.hasCompletedOnboarding || false);
      }
      
      setUser(user);
      return user;
    } catch (error) {
      setLoading(false); // Only set loading to false on error
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user_data');
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: username
      });
      
      const initialUserData = {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
        isFirstTime: true,
        hasCompletedOnboarding: false,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), initialUserData);
      return user;
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

  const updateOnboardingStatus = async (completed) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          hasCompletedOnboarding: completed
        }, { merge: true });
        setHasCompletedOnboarding(completed);
      } catch (error) {
        console.error('Error updating onboarding status:', error);
        throw error;
      }
    }
  };

  if (loading || !isInitialized) {
    return null; // The LoginScreen will handle showing the loading state
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        updateOnboardingStatus,
        login,
        logout,
        signup,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 