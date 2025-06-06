import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { auth } from '../config/firebase';

const SelfCareAreaContext = createContext();

export function SelfCareAreaProvider({ children }) {
  const [userAreas, setUserAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set up real-time listener for self-care areas
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No current user found in SelfCareAreaContext');
      return;
    }

    console.log('Setting up real-time listener in SelfCareAreaContext');
    const userRef = doc(db, 'users', currentUser.uid);
    const areasRef = collection(userRef, 'selfCareAreas');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(areasRef, (snapshot) => {
      console.log('SelfCareAreaContext: Received real-time update');
      const areas = [];
      snapshot.forEach((doc) => {
        areas.push({ id: doc.id, ...doc.data() });
      });
      console.log('SelfCareAreaContext: New areas data:', areas);
      setUserAreas(areas);
    }, (error) => {
      console.error('Error in self-care areas listener:', error);
    });

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up real-time listener in SelfCareAreaContext');
      unsubscribe();
    };
  }, []);

  // This function can be called from anywhere to refresh areas
  const refreshAreas = useCallback(async (fetchAreasFn) => {
    setIsLoading(true);
    try {
      const areas = await fetchAreasFn();
      setUserAreas(areas);
    } catch (e) {
      console.error('Error refreshing areas:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SelfCareAreaContext.Provider value={{ userAreas, setUserAreas, isLoading, refreshAreas }}>
      {children}
    </SelfCareAreaContext.Provider>
  );
}

export function useSelfCareAreas() {
  return useContext(SelfCareAreaContext);
} 