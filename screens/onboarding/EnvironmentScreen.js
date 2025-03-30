import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';

const environments = [
  { id: 'gym', name: 'Gym', description: 'Access to full gym equipment' },
  { id: 'home', name: 'Home', description: 'Limited equipment, bodyweight focus' },
];

const EnvironmentScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedEnvironment, setSelectedEnvironment] = React.useState(onboardingData.environment);

  const handleEnvironmentSelect = (environmentId) => {
    setSelectedEnvironment(environmentId);
    updateOnboardingData('environment', environmentId);
  };

  const handleNext = () => {
    if (selectedEnvironment) {
      navigation.navigate('TrainingFrequency');
    }
  };

  return (
    <OnboardingCard
      title="Choose Your Training Environment"
      currentStep={4}
      totalSteps={6}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {environments.map((environment) => (
          <TouchableOpacity
            key={environment.id}
            style={[
              styles.environmentButton,
              selectedEnvironment === environment.id && styles.selectedEnvironment,
            ]}
            onPress={() => handleEnvironmentSelect(environment.id)}
          >
            <Text style={[
              styles.environmentName,
              selectedEnvironment === environment.id && styles.selectedEnvironmentText,
            ]}>
              {environment.name}
            </Text>
            <Text style={[
              styles.environmentDescription,
              selectedEnvironment === environment.id && styles.selectedEnvironmentText,
            ]}>
              {environment.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 15,
  },
  environmentButton: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  selectedEnvironment: {
    backgroundColor: '#6d28d9',
    borderColor: '#d8b4fe',
  },
  environmentName: {
    color: '#d8b4fe',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  environmentDescription: {
    color: '#a78bfa',
    fontSize: 14,
  },
  selectedEnvironmentText: {
    color: '#ffffff',
  },
});

export default EnvironmentScreen; 