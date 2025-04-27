import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ExerciseTableScreen from '../screens/ExerciseTableScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

/**
 * Main app navigation component that handles the stack navigation
 * and authentication flow
 * @returns {JSX.Element} The app navigation component
 */
export default function AppNavigator() {
  const { user, hasCompletedOnboarding } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          }
        }}
      >
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={TabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="ExerciseTable" 
              component={ExerciseTableScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 