import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadFonts, FONTS } from '../config/fonts';

const { width } = Dimensions.get('window');

const steps = [
  {
    image: require('../assets/onboardingpics/r1.png'),
  },
  {
    image: require('../assets/onboardingpics/r2.png'),
  },
  {
    image: require('../assets/onboardingpics/r3.png'),
  },
  {
    image: require('../assets/onboardingpics/r4.png'),
  },
  {
    image: require('../assets/onboardingpics/r5.png'),
    isFinal: true,
  },
];

export default function OnboardingHistoryScreen() {
  const [step, setStep] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    async function initializeFonts() {
      const loaded = await loadFonts();
      setFontsLoaded(loaded);
    }
    initializeFonts();
  }, []);

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Test Cinzel Bold rendering */}
      <Text style={{ fontSize: 32, ...FONTS.cinzelBold }}>Test Cinzel Bold</Text>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{`Do you relate to the\nstatement below?`}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={steps[step].image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.buttonRow}>
        {steps[step].isFinal ? (
          <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
            <Text style={styles.ctaButtonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    padding: 8,
    zIndex: 2,
  },
  backArrow: {
    fontSize: 28,
    color: '#222',
    ...FONTS.cinzel,
  },
  title: {
    fontSize: 28,
    color: '#222',
    marginTop: 128,
    textAlign: 'center',
    ...FONTS.cinzelBold,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  image: {
    width: '120%',
    height: 450,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#11181C',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginHorizontal: 10,
    minWidth: 140,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    ...FONTS.cinzelBold,
  },
  ctaButton: {
    backgroundColor: '#11181C',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 60,
    alignSelf: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    ...FONTS.cinzelBold,
  },
  cinzel: {
    ...FONTS.cinzel,
  },
}); 