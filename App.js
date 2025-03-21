import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import TrainingScreen from './screens/TrainingScreen';
import ProfileScreen from './screens/ProfileScreen';
import { StatusBar } from 'expo-status-bar';
import { Icons } from './components/Icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#000000',
          position: 'absolute',
          bottom: 35,
          marginHorizontal: '10%',
          height: 60,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: 'rgba(216, 180, 254, 0.3)',
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: '#d8b4fe',
        tabBarInactiveTintColor: '#6b7280',
        tabBarItemStyle: {
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icons name="home" size={28} color={color} />,
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icons name="activity" size={28} color={color} />,
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Icons name="user" size={28} color={color} />,
          tabBarShowLabel: false,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
