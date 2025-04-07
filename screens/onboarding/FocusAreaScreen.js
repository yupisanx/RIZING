import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const focusAreas = [
  { id: 'arms', name: 'Arms' },
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'core', name: 'Core' },
  { id: 'legs', name: 'Legs' },
  { id: 'full_body', name: 'Full Body' },
];

const FocusAreaScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { setHasCompletedOnboarding } = useAuth();
  const [selectedAreas, setSelectedAreas] = React.useState(onboardingData.focusArea ? [onboardingData.focusArea] : []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAreaSelect = (areaId) => {
    setSelectedAreas(prev => {
      let newSelection;
      
      // If full_body is being selected, clear other selections
      if (areaId === 'full_body') {
        newSelection = ['full_body'];
      }
      // If another area is being selected
      else {
        // If full_body was previously selected, remove it
        const withoutFullBody = prev.filter(id => id !== 'full_body');
        
        // Toggle the selected area
        if (withoutFullBody.includes(areaId)) {
          newSelection = withoutFullBody.filter(id => id !== areaId);
        } else {
          newSelection = [...withoutFullBody, areaId];
        }
      }
      
      // Update the onboarding data with the new selection
      updateOnboardingData('focusArea', newSelection);
      return newSelection;
    });
  };

  const createPlayerProfile = async () => {
    try {
      if (selectedAreas.length === 0) {
        Alert.alert(
          'No Focus Area Selected',
          'Please select at least one focus area before proceeding.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsSubmitting(true);
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Convert selectedAreas array to a map to avoid nested arrays
      const focusAreasMap = selectedAreas.reduce((acc, area) => {
        acc[area] = true;
        return acc;
      }, {});

      const playerData = {
        ...onboardingData,
        level: 1,
        xp: 0,
        statPoints: 0,
        stats: {
          strength: 0,
          vitality: 0,
          agility: 0,
          intelligence: 0,
          sense: 0,
        },
        currentQuestIndex: 0,
        streak: 0,
        lastQuestGeneratedAt: null,
        countdownEnd: null,
        createdAt: new Date(),
        lastUpdated: new Date(),
        hasCompletedOnboarding: true,
        isFirstTime: false,
        frequency: onboardingData.trainingDays,
        focusAreas: focusAreasMap, // Store as a map instead of array
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), playerData);
      
      // Update local storage with all onboarding data
      await AsyncStorage.setItem('@onboarding_data', JSON.stringify({
        ...onboardingData,
        hasCompletedOnboarding: true
      }));
      
      // Update auth context
      setHasCompletedOnboarding(true);
      
    } catch (error) {
      console.error('Error creating player profile:', error);
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <OnboardingCard
        title="Choose Your Focus Area"
        description="Select your primary training focus (optional)."
        currentStep={6}
        totalSteps={6}
        onNext={createPlayerProfile}
        onBack={() => navigation.goBack()}
      >
        <View style={styles.avatarContainer}>
          {console.log('FocusAreaScreen - Full onboarding data:', onboardingData)}
          {console.log('FocusAreaScreen - Current gender:', onboardingData.gender)}
          <Image 
            source={onboardingData.gender === 'male' 
              ? require('../../assets/avatars/male-avatar.png')
              : require('../../assets/avatars/female-avatar.png')
            }
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {focusAreas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.areaButton,
                  selectedAreas.includes(area.id) && styles.selectedArea,
                  (area.id === 'arms' || area.id === 'full_body') && styles.widerButton,
                  (area.id === 'legs' || area.id === 'chest') && styles.slightlyWiderButton,
                ]}
                onPress={() => handleAreaSelect(area.id)}
              >
                <Text style={[
                  styles.areaName,
                  selectedAreas.includes(area.id) && styles.selectedAreaText,
                ]}>
                  {area.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </OnboardingCard>
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#d8b4fe" />
          <Text style={styles.loadingText}>Creating your profile...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    width: '50%',
    alignSelf: 'flex-start',
    marginLeft: '0%',
    gap: 15,
    paddingBottom: 20,
    marginTop: 20,
    zIndex: 1,
  },
  areaButton: {
    backgroundColor: '#1A1B1E',
    padding: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    alignItems: 'center',
    width: '100%',
  },
  areaName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  selectedArea: {
    backgroundColor: '#1A1B1E',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  selectedAreaText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#60a5fa',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    right: -200,
    top: -40,
    height: 600,
    width: '100%',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 560,
    height: 560,
  },
  widerButton: {
    width: '120%',
  },
  slightlyWiderButton: {
    width: '110%',
  },
});

export default FocusAreaScreen; 