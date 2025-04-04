import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WelcomeProvider, useWelcome } from './contexts/WelcomeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { MenuProvider } from './contexts/MenuContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import QuestScreen from './screens/QuestScreen';
import RankingScreen from './screens/RankingScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoadingScreen from './components/LoadingScreen';
import Menu from './components/Menu';
import { StatusBar } from 'expo-status-bar';
import { Icons } from './components/Icons';
import { theme } from './utils/theme';
import { isTablet, isDesktop, isLandscape, platformSelect } from './utils/responsive';
import { Dimensions } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Memoized tab icon component
const TabIcon = React.memo(({ name, color, size }) => (
  <Icons name={name} size={size} color={color} />
));

function TabNavigator() {
  const { showingWelcome } = useWelcome();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    // Simulate loading assets or data
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    // Handle orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'LANDSCAPE' : 'PORTRAIT');
    });

    return () => {
      clearTimeout(timer);
      subscription?.remove();
    };
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          height: platformSelect({
            ios: theme.spacing.xl * 2 + insets.bottom,
            android: theme.spacing.xl * 1.8 + insets.bottom,
            default: theme.spacing.xl * 2 + insets.bottom,
          }),
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom,
          display: showingWelcome ? 'none' : 'flex',
          zIndex: 999999,
          elevation: 999999,
          ...theme.shadows.small,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 2,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inactive,
        tabBarItemStyle: {
          padding: theme.spacing.sm,
          paddingBottom: theme.spacing.xs,
          paddingTop: theme.spacing.xs,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="ranking" 
              size={isTablet ? 32 : 28} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Ranking tab",
        }}
      />
      <Tab.Screen
        name="Quest"
        component={QuestScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="book" 
              size={isTablet ? 32 : 28} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Quest tab",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="user" 
              size={isTablet ? 32 : 28} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Profile tab",
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
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
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
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

