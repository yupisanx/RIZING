import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState({});

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await AsyncStorage.getItem('@onboarding_data');
      if (data) {
        const parsedData = JSON.parse(data);
        setOnboardingData(parsedData);
        setHasCompletedOnboarding(parsedData.hasCompletedOnboarding || false);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingData = async (key, value) => {
    try {
      const newData = {
        ...onboardingData,
        [key]: value
      };
      setOnboardingData(newData);
      await AsyncStorage.setItem('@onboarding_data', JSON.stringify(newData));
    } catch (error) {
      console.error('Error updating onboarding data:', error);
      throw error;
    }
  };

  const completeOnboarding = async (userData) => {
    try {
      const newData = {
        ...onboardingData,
        ...userData,
        hasCompletedOnboarding: true
      };
      await AsyncStorage.setItem('@onboarding_data', JSON.stringify(newData));
      setOnboardingData(newData);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        loading,
        onboardingData,
        updateOnboardingData,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}; 