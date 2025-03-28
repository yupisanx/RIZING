import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWelcome } from '../contexts/WelcomeContext';

const welcomeSequence = [
  {
    id: 1,
    type: 'INFO',
    message: '[INITIALIZING NEW PLAYER PROTOCOL...]',
    highlightWords: ['PROTOCOL'],
    hasAction: false,
  },
  {
    id: 2,
    type: 'INFO',
    message: '[AH, A NEW HUNTER HAS ARRIVED...]',
    highlightWords: ['HUNTER'],
    hasAction: false,
  },
  {
    id: 3,
    type: 'INFO',
    message: '[I SENSE YOUR POTENTIAL... ONE WITH EXTRAORDINARY POWER]',
    highlightWords: ['EXTRAORDINARY', 'POWER'],
    hasAction: false,
  },
  {
    id: 4,
    type: 'CONFIRM',
    message: '[ARE YOU READY TO BEGIN YOUR JOURNEY, HUNTER?]',
    highlightWords: ['JOURNEY', 'HUNTER'],
    hasAction: true,
  },
];

const WELCOME_SHOWN_KEY = '@welcome_shown';

export const useWelcomeSequence = (userId) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { setShowingWelcome } = useWelcome();

  useEffect(() => {
    if (userId && !hasInitialized) {
      checkFirstTimeUser();
    }
  }, [userId, hasInitialized]);

  useEffect(() => {
    setShowingWelcome(showMessage);
  }, [showMessage, setShowingWelcome]);

  const checkFirstTimeUser = async () => {
    if (!userId) return;

    try {
      // Always mark as not first time user
      await AsyncStorage.setItem(`${WELCOME_SHOWN_KEY}_${userId}`, 'true');
      
      // Try to sync with Firebase in background
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isFirstTime: false,
        });
      } catch (firebaseError) {
        // Continue if Firebase fails
        console.log('Firebase update failed, saved locally only');
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.log('Failed to save welcome status');
      setHasInitialized(true);
    }
  };

  const markUserAsNotFirst = async () => {
    if (!userId) return;

    try {
      // Save to AsyncStorage first
      await AsyncStorage.setItem(`${WELCOME_SHOWN_KEY}_${userId}`, 'true');
      
      // Try to sync with Firebase
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isFirstTime: false,
        });
      } catch (firebaseError) {
        // Continue if Firebase fails
        console.log('Firebase update failed, saved locally only');
      }
    } catch (error) {
      console.log('Failed to save welcome status');
    }
  };

  const handleNext = () => {
    if (currentMessageIndex < welcomeSequence.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      setShowMessage(false);
      markUserAsNotFirst();
    }
  };

  const handleAction = (accepted) => {
    if (accepted) {
      setShowMessage(false);
      markUserAsNotFirst();
    } else {
      // If user clicks NO, still mark as not first time but don't proceed
      setShowMessage(false);
      markUserAsNotFirst();
    }
  };

  return {
    currentMessage: welcomeSequence[currentMessageIndex],
    showMessage,
    handleNext,
    handleAction,
  };
};

export default useWelcomeSequence; 