import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import onboarding screens
import GenderAvatarScreen from './onboarding/GenderAvatarScreen';
import TrainingClassScreen from './onboarding/TrainingClassScreen';
import TrainingRankScreen from './onboarding/TrainingRankScreen';
import EnvironmentScreen from './onboarding/EnvironmentScreen';
import TrainingFrequencyScreen from './onboarding/TrainingFrequencyScreen';
import FocusAreaScreen from './onboarding/FocusAreaScreen';

const Stack = createNativeStackNavigator();

const OnboardingScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GenderAvatar" component={GenderAvatarScreen} />
      <Stack.Screen name="TrainingClass" component={TrainingClassScreen} />
      <Stack.Screen name="TrainingRank" component={TrainingRankScreen} />
      <Stack.Screen name="Environment" component={EnvironmentScreen} />
      <Stack.Screen name="TrainingFrequency" component={TrainingFrequencyScreen} />
      <Stack.Screen name="FocusArea" component={FocusAreaScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingScreen; 