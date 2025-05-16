import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
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
import { loadFonts } from './utils/fonts';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Main App component that initializes the application
 * @returns {JSX.Element} The root application component
 */
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Load fonts using centralized font management
        const fontsLoaded = await loadFonts();
        setFontsLoaded(fontsLoaded);
        
        // Add any other initialization logic here
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Continue without custom fonts
        setFontsLoaded(true);
      } finally {
        // Hide splash screen with a smooth fade
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AuthProvider>
            <OnboardingProvider>
              <WelcomeProvider>
                <MenuProvider>
                  <AppNavigator />
                  <StatusBar style="light" />
                </MenuProvider>
              </WelcomeProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

