import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingContext = createContext();

const STORAGE_KEY = '@onboarding_data';

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    gender: null,
    avatarId: null,
    class: null,
    rank: null,
    environment: null,
    trainingDays: null,
    focusArea: null,
  });

  // Load data from storage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Loaded onboarding data:', parsedData);
          setOnboardingData(parsedData);
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      }
    };
    loadData();
  }, []);

  const updateOnboardingData = async (key, value) => {
    try {
      console.log('Updating onboarding data:', { key, value });
      setOnboardingData(prevData => {
        const newData = {
          ...prevData,
          [key]: value
        };
        console.log('New onboarding data:', newData);
        // Save to storage immediately
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const resetOnboardingData = async () => {
    try {
      const emptyData = {
        gender: null,
        avatarId: null,
        class: null,
        rank: null,
        environment: null,
        trainingDays: null,
        focusArea: null,
      };
      setOnboardingData(emptyData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
    } catch (error) {
      console.error('Error resetting onboarding data:', error);
    }
  };

  // Log state changes
  useEffect(() => {
    console.log('Onboarding data changed:', onboardingData);
  }, [onboardingData]);

  return (
    <OnboardingContext.Provider value={{
      onboardingData,
      updateOnboardingData,
      resetOnboardingData,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 