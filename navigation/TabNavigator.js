import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform } from 'react-native';
import { Icons } from '../components/Icons';
import { theme } from '../utils/theme';
import { isTablet, platformSelect } from '../utils/responsive';
import { useWelcome } from '../contexts/WelcomeContext';
import LoadingScreen from '../components/LoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import QuestScreen from '../screens/QuestScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Memoized tab icon component for consistent rendering
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name
 * @param {string} props.color - Icon color
 * @param {number} props.size - Icon size
 */
const TabIcon = React.memo(({ name, color, size }) => (
  <Icons name={name} size={size} color={color} />
));

/**
 * Main tab navigation component that handles the bottom tab navigation
 * @returns {JSX.Element} The tab navigation component
 */
export default function TabNavigator() {
  const { showingWelcome } = useWelcome();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1000);
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
            android: theme.spacing.xl * 2.8,
            default: theme.spacing.xl * 2 + insets.bottom,
          }),
          borderTopWidth: Platform.OS === 'android' ? 0 : 1,
          borderBottomWidth: Platform.OS === 'android' ? 1 : 0,
          borderTopColor: theme.colors.border,
          borderBottomColor: theme.colors.border,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'android' ? 0 : 0,
          left: 0,
          right: 0,
          paddingBottom: Platform.OS === 'android' ? 20 : insets.bottom,
          display: showingWelcome ? 'none' : 'flex',
          zIndex: 999999,
          elevation: 999999,
          ...theme.shadows.small,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...theme.typography.body,
          fontSize: 8,
          lineHeight: 12,
          marginBottom: Platform.OS === 'android' ? 0 : 2,
          fontFamily: 'PressStart2P',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inactive,
        tabBarItemStyle: {
          padding: theme.spacing.sm,
          paddingBottom: Platform.OS === 'android' ? theme.spacing.xs : theme.spacing.xs + 8,
          paddingTop: Platform.OS === 'android' ? theme.spacing.xs - 4 : theme.spacing.xs,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="home" 
              size={isTablet ? 32 : 28} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Home tab",
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