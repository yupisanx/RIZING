import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { WelcomeProvider } from './contexts/WelcomeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { MenuProvider } from './contexts/MenuContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Menu from './components/Menu';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';

/**
 * Main App component that initializes the application
 * @returns {JSX.Element} The root application component
 */
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'PressStart2P': require('./assets/fonts/PressStart2P-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue without custom fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AuthProvider>
            <WelcomeProvider>
              <OnboardingProvider>
                <MenuProvider>
                  <AppNavigator />
                  <Menu />
                  <StatusBar style="light" />
                </MenuProvider>
              </OnboardingProvider>
            </WelcomeProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

