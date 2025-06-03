import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ExerciseTableScreen from '../screens/ExerciseTableScreen';
import GoalScreen from '../screens/GoalScreen';
import MenuScreen from '../screens/MenuScreen';
import TabNavigator from './TabNavigator';
import Menu from '../components/Menu';
import LoadingScreen from '../screens/LoadingScreen';
import SelfCareAreaScreen from '../screens/SelfCareAreaScreen';
import { SelfCareAreaProvider } from '../contexts/SelfCareAreaContext';
import { GoalsProvider } from '../contexts/GoalsContext';
import PreGoalScreen from '../screens/PreGoalScreen';

const Stack = createNativeStackNavigator();

/**
 * Main app navigation component that handles the stack navigation
 * and authentication flow
 * @returns {JSX.Element} The app navigation component
 */
export default function AppNavigator() {
  const { user, loading, hasCompletedOnboarding } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SelfCareAreaProvider>
      <GoalsProvider>
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
                  name="LoginScreen" 
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
                <Stack.Screen 
                  name="Goal" 
                  component={GoalScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen 
                  name="Menu" 
                  component={MenuScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen 
                  name="SelfCareArea" 
                  component={SelfCareAreaScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen 
                  name="PreGoalScreen" 
                  component={PreGoalScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
              </>
            )}
          </Stack.Navigator>
          <Menu />
        </NavigationContainer>
      </GoalsProvider>
    </SelfCareAreaProvider>
  );
} 