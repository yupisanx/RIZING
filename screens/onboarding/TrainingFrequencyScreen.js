import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';

const frequencyLabels = {
  1: 'Casual: Just getting started',
  2: 'Regular: Building a routine',
  3: 'Dedicated: Making it a habit',
  4: 'Elite: I\'m aiming for the top, whatever the cost',
  5: 'Master: Living and breathing fitness'
};

const TrainingFrequencyScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [frequency, setFrequency] = React.useState(onboardingData.trainingDays || 1);

  const handleFrequencyChange = (value) => {
    setFrequency(value);
    updateOnboardingData('trainingDays', value);
  };

  const handleNext = () => {
    if (frequency) {
      navigation.navigate('FocusArea');
    }
  };

  return (
    <OnboardingCard
      title="How often do you want to complete quests?"
      currentStep={9}
      totalSteps={15}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <Text style={styles.frequencyValue}>+{frequency} times / week</Text>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={frequency}
            onValueChange={handleFrequencyChange}
            minimumTrackTintColor="#6d28d9"
            maximumTrackTintColor="#1e1e1e"
            thumbTintColor="#d8b4fe"
          />
          <View style={styles.labelContainer}>
            <Text style={styles.frequencyLabel}>{frequencyLabels[frequency]}</Text>
          </View>
        </View>
      </View>
    </OnboardingCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  frequencyValue: {
    color: '#60a5fa',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 60,
  },
  sliderContainer: {
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  frequencyLabel: {
    color: '#60a5fa',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TrainingFrequencyScreen; 