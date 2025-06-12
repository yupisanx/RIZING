import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Platform, Animated } from 'react-native';
import ContractScreen from './ContractScreen';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';

const images = [
  require('../assets/brand-icon.png'), // Brand icon
  require('../assets/onboardingpics/r1.png'),
  require('../assets/onboardingpics/r2.png'),
  require('../assets/onboardingpics/r3.png'),
  require('../assets/onboardingpics/r4.png'),
];

export default function CopyScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      if (step < images.length - 1) {
        setStep(prev => prev + 1);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      } else {
        // Navigate directly to contract screen
        navigation.navigate('Contract');
      }
    });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      // If we're at the first step, navigate to the start screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'StartScreenn' }],
      });
    }
  };

  const promptMarginTop = Platform.select({ ios: 70, android: 110 });
  const buttonMarginBottom = Platform.select({ ios: 70, android: 90 });

  const renderContent = () => {
    if (step === 0) {
      // Brand icon screen
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <Image
              source={images[0]}
              style={{ width: 260, height: 260, resizeMode: 'contain' }}
            />
            <Text style={{ 
              color: 'white', 
              fontSize: 26, 
              fontFamily: 'Cinzel', 
              position: 'absolute',
              bottom: 20,
              textAlign: 'center',
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4
            }}>
              MC App
            </Text>
          </View>
        </View>
      );
    }

    // Regular onboarding screens
    return (
      <>
        <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 10 }}>
          <Text style={{ color: 'white', fontSize: 25, fontFamily: 'Cinzel', textAlign: 'center', marginTop: promptMarginTop }}>
            {`Do you relate to the\nstatement below?`}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Image
            source={images[step]}
            style={{ width: '130%', height: '100%', resizeMode: 'contain', borderRadius: 24 }}
          />
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Back Button - Only show after first step */}
        {step > 0 && (
          <TouchableOpacity 
            style={{ position: 'absolute', top: 60, left: 20, zIndex: 1 }}
            onPress={() => { 
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleBack();
            }}
          >
            <AntDesign name="back" size={34} color="white" />
          </TouchableOpacity>
        )}

        {renderContent()}

        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: buttonMarginBottom }}>
          <TouchableOpacity
            style={{ backgroundColor: '#fff', borderRadius: 32, paddingVertical: 13, paddingHorizontal: 36, marginLeft: 10, marginRight: 15, minWidth: 150 }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleNext(); }}
          >
            <Text style={{ color: '#11181C', fontSize: 18, textAlign: 'center', fontFamily: 'Cinzel' }}>
              {step === 0 ? 'Get Started' : 'No'}
            </Text>
          </TouchableOpacity>
          {step > 0 && (
            <TouchableOpacity
              style={{ backgroundColor: '#fff', borderRadius: 32, paddingVertical: 13, paddingHorizontal: 36, marginLeft: 25, marginRight: 10, minWidth: 150 }}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleNext(); }}
            >
              <Text style={{ color: '#11181C', fontSize: 18, textAlign: 'center', fontFamily: 'Cinzel' }}>Yes</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
} 