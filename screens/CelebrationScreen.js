import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';

export default function CelebrationScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { updateOnboardingStatus } = useAuth();

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Just update the onboarding status and let the navigation handle itself
      await updateOnboardingStatus(true);
      // No need to manually navigate - AppNavigator will handle it
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <View style={styles.celebrationOverlay}>
      <View style={styles.celebrationContent}>
        <Animated.Text style={[styles.celebrationText, { opacity: fadeAnim }]}> 
          <Text style={styles.celebrationTextLine}>This is a great start,{"\n"}</Text>
          <Text style={styles.celebrationTextLine}>well done!</Text>
        </Animated.Text>
        <View style={styles.confettiContainer}>
          <ConfettiCannon
            count={50}
            origin={{ x: 0, y: 0 }}
            autoStart={true}
            fadeOut={true}
            fallSpeed={1800}
            explosionSpeed={400}
            colors={['#87CEEB', '#E5E7EB']}
            autoStartDelay={0}
            size={Platform.OS === 'android' ? 5 : 1}
          />
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.continueButton, 
          { 
            width: '50%',
            height: Platform.OS === 'android' ? 54 : 50,
            marginBottom: Platform.OS === 'ios' ? -5 : Platform.OS === 'android' ? -60 : 0,
          }
        ]}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  celebrationOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'android' ? 120 : 60,
    alignItems: 'center',
  },
  celebrationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Cinzel',
    marginBottom: 40,
  },
  celebrationTextLine: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Cinzel',
  },
  continueButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Cinzel',
    textAlign: 'center',
  },
}); 