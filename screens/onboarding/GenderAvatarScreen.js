import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Icons } from '../../components/Icons';

const { width, height } = Dimensions.get('window');

const GenderAvatarScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGender, setSelectedGender] = React.useState(onboardingData.gender || 'male');
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Update selectedGender when onboardingData changes
  useEffect(() => {
    if (onboardingData.gender) {
      setSelectedGender(onboardingData.gender);
    }
  }, [onboardingData.gender]);

  // Reset isNavigating when component mounts or screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsNavigating(false);
      // Update local state with current onboarding data
      if (onboardingData.gender) {
        setSelectedGender(onboardingData.gender);
      }
    });

    return unsubscribe;
  }, [navigation, onboardingData.gender]);

  const toggleGender = async () => {
    const newGender = selectedGender === 'male' ? 'female' : 'male';
    console.log('Toggling gender to:', newGender);
    
    // Update local state first
    setSelectedGender(newGender);
    
    // Then update the context and storage
    await updateOnboardingData('gender', newGender);
    await updateOnboardingData('avatarId', `${newGender}1`);
  };

  const handleNext = async () => {
    if (selectedGender && !isNavigating) {
      setIsNavigating(true);
      try {
        // Ensure gender is saved before navigation
        await updateOnboardingData('gender', selectedGender);
        await updateOnboardingData('avatarId', `${selectedGender}1`);
        console.log('Navigating with gender:', selectedGender);
        navigation.navigate('TrainingClass');
      } catch (error) {
        console.warn('Navigation error:', error);
        setIsNavigating(false);
      }
    }
  };

  const arrowRight = Platform.OS === 'android' ? '›' : '❯';

  return (
    <View style={styles.screenContainer}>
      <OnboardingCard
        title="Select your Gender"
        currentStep={1}
        totalSteps={15}
        onNext={handleNext}
        style={styles.cardContent}
        hideProgress={true}
      >
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image 
                source={selectedGender === 'male' 
                  ? require('../../assets/avatars/male-avatar.png')
                  : require('../../assets/avatars/female-avatar.png')
                }
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>

            {/* Right Arrow */}
            <TouchableOpacity 
              style={styles.arrowButton} 
              onPress={toggleGender}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Icons name="modern-arrow" size={68} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </OnboardingCard>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cardContent: {
    paddingTop: 20,
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  avatarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: -70,
    paddingHorizontal: 20,
  },
  arrowButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 10,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '300',
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: 56,
  },
  androidArrowText: {
    fontSize: 68,
    marginTop: 0,
    textAlign: 'center',
    lineHeight: 68,
  },
  avatarWrapper: {
    flex: 1,
    height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.2 }],
  },
  genderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 2,
  },
});

export default GenderAvatarScreen; 