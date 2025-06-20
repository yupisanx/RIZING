import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform, View } from 'react-native';
import { Icons } from '../components/Icons';
import { theme } from '../utils/theme';
import { isTablet, platformSelect } from '../utils/responsive';
import { useWelcome } from '../contexts/WelcomeContext';
import LoadingScreen from '../components/LoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import SelfCareAreaScreen from '../screens/SelfCareAreaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import * as Haptics from 'expo-haptics';

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
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'LANDSCAPE' : 'PORTRAIT');
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            height: platformSelect({
              ios: theme.spacing.xl * 2 + insets.bottom,
              android: theme.spacing.xl * 2.8 + insets.bottom,
              default: theme.spacing.xl * 2 + insets.bottom,
            }),
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8,
            paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
            paddingTop: Platform.OS === 'android' ? 8 : 0,
            display: showingWelcome ? 'none' : 'flex',
            zIndex: 1000,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            ...theme.typography.body,
            fontSize: 12,
            lineHeight: 16,
            marginBottom: Platform.OS === 'android' ? 0 : 2,
            fontFamily: 'Cinzel',
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
        screenListeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
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
          name="Areas"
          component={SelfCareAreaScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <TabIcon 
                name="book" 
                size={isTablet ? 32 : 28} 
                color={color} 
              />
            ),
            tabBarAccessibilityLabel: "Areas tab",
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
    </View>
  );
} 