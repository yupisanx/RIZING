import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { Icons } from '../components/Icons';
import { theme } from '../utils/theme';
import { isTablet, platformSelect } from '../utils/responsive';
import { useWelcome } from '../contexts/WelcomeContext';
import LoadingScreen from '../components/LoadingScreen';
import RankingScreen from '../screens/RankingScreen';
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
          ...theme.typography.body,
          fontSize: 8,
          lineHeight: 12,
          marginBottom: 2,
          fontFamily: 'PressStart2P',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inactive,
        tabBarItemStyle: {
          padding: theme.spacing.sm,
          paddingBottom: theme.spacing.xs + 8,
          paddingTop: theme.spacing.xs,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Rank"
        component={RankingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="ranking" 
              size={isTablet ? 32 : 28} 
              color={color} 
            />
          ),
          tabBarAccessibilityLabel: "Rank tab",
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