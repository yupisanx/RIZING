import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';

const trainingClasses = [
  { 
    id: 'healer', 
    name: 'HEALER', 
    description: 'Focus on recovery, balance, and cutting excess weight'
  },
  { 
    id: 'tanker', 
    name: 'TANKER', 
    description: 'Build size, strength, and become unbreakable'
  },
  { 
    id: 'assassin', 
    name: 'ASSASSIN', 
    description: 'Agile, fast, and built for performance'
  },
  { 
    id: 'mage', 
    name: 'MAGE', 
    description: 'Smart, balanced, and in control of your whole body'
  },
];

const TrainingClassScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedClass, setSelectedClass] = React.useState(onboardingData.class);

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    updateOnboardingData('class', classId);
  };

  const handleNext = () => {
    if (selectedClass) {
      navigation.navigate('TrainingRank');
    }
  };

  return (
    <OnboardingCard
      title="Choose your class"
      currentStep={2}
      totalSteps={15}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {trainingClasses.map((trainingClass) => (
          <TouchableOpacity
            key={trainingClass.id}
            style={[
              styles.classOption,
              selectedClass === trainingClass.id && styles.selectedOption,
            ]}
            onPress={() => handleClassSelect(trainingClass.id)}
          >
            <Text style={[
              styles.className,
              selectedClass === trainingClass.id && styles.selectedOptionText,
            ]}>
              {trainingClass.name}
            </Text>
            <Text style={[
              styles.classDescription,
              selectedClass === trainingClass.id && styles.selectedOptionText,
            ]}>
              {trainingClass.description}
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
  classOption: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  selectedOption: {
    backgroundColor: '#6d28d9',
    borderColor: '#d8b4fe',
  },
  className: {
    color: '#d8b4fe',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  classDescription: {
    color: '#8E8E93',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
});

export default TrainingClassScreen; 