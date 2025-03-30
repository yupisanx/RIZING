import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';

const trainingRanks = [
  { id: 'beginner', name: 'Beginner', description: 'Starting your fitness journey' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some experience with regular training' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced with intense workouts' },
];

const TrainingRankScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedRank, setSelectedRank] = React.useState(onboardingData.rank);

  const handleRankSelect = (rankId) => {
    setSelectedRank(rankId);
    updateOnboardingData('rank', rankId);
  };

  const handleNext = () => {
    if (selectedRank) {
      navigation.navigate('Environment');
    }
  };

  return (
    <OnboardingCard
      title="Select Your Training Rank"
      currentStep={3}
      totalSteps={6}
      onNext={handleNext}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {trainingRanks.map((rank) => (
          <TouchableOpacity
            key={rank.id}
            style={[
              styles.rankButton,
              selectedRank === rank.id && styles.selectedRank,
            ]}
            onPress={() => handleRankSelect(rank.id)}
          >
            <Text style={[
              styles.rankName,
              selectedRank === rank.id && styles.selectedRankText,
            ]}>
              {rank.name}
            </Text>
            <Text style={[
              styles.rankDescription,
              selectedRank === rank.id && styles.selectedRankText,
            ]}>
              {rank.description}
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
  rankButton: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  selectedRank: {
    backgroundColor: '#6d28d9',
    borderColor: '#d8b4fe',
  },
  rankName: {
    color: '#d8b4fe',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rankDescription: {
    color: '#8E8E93',
    fontSize: 14,
  },
  selectedRankText: {
    color: '#ffffff',
  },
});

export default TrainingRankScreen; 