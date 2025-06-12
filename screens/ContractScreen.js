import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, Platform, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { doc, collection, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function ContractScreen({ navigation }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const pathRef = useRef('');
  const isDrawing = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { updateOnboardingStatus, user } = useAuth();

  // Add debug log for initial render
  useEffect(() => {
    console.log('ContractScreen mounted');
  }, []);

  const contractItems = [
    "I'll achieve my goal!",
    "I'll make the most of my day!",
    "I'll keep my life organized!",
    "I'll feel completely worry-free!",
    "I'll be more productive!",
    "I'll be the best version of myself!",
  ];

  const onGestureEvent = (event) => {
    if (!isDrawing.current) return;
    
    const { x, y } = event.nativeEvent;

    if (pathRef.current === '') {
      pathRef.current = `M${x},${y}`;
    } else {
      pathRef.current += ` L${x},${y}`;
    }

    setCurrentPath(pathRef.current);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      isDrawing.current = true;
      pathRef.current = '';
    } else if (event.nativeEvent.state === State.END) {
      isDrawing.current = false;
      if (pathRef.current) {
        setPaths((prev) => [...prev, pathRef.current]);
      }
      pathRef.current = '';
    }
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  };

  const handleConfirm = async () => {
    try {
      // Navigate to celebration screen
      navigation.navigate('Celebration');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleContinue = () => {
    console.log('Continue button pressed');
        setShowCelebration(false);
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
  };

  const isSignaturePresent = paths.length > 0;

  useEffect(() => {
    if (showCelebration) {
      console.log('Celebration effect triggered');
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [showCelebration]);

  // Add debug log for showCelebration state changes
  useEffect(() => {
    console.log('showCelebration state changed:', showCelebration);
  }, [showCelebration]);

  if (showCelebration) {
    console.log('Rendering celebration screen');
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

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.contentWrapper}>
            {/* Header with icon */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {/* Removed heart icon */}
              </View>
            </View>

            {/* Main heading */}
            <Text style={styles.title}>
              Let's make a{'\n'}contract
            </Text>

            {/* Contract items */}
            <View style={styles.contractItems}>
              {contractItems.map((item, index) => (
                <View key={index} style={styles.contractItem}>
                  <Text style={styles.contractText}>• {item}</Text>
                </View>
              ))}
            </View>

            {/* Signature area */}
            <View style={styles.signatureContainer}>
              <View style={styles.signatureArea}>
                <Text style={styles.signatureLabel}>Use your finger to sign your nickname:</Text>
                <PanGestureHandler 
                  onGestureEvent={onGestureEvent} 
                  onHandlerStateChange={onHandlerStateChange}
                  minDist={0}
                  maxPointers={1}
                >
                  <View style={styles.canvas}>
                    <Svg height="190" width={width - 16} style={styles.svg}>
                      {paths.map((path, index) => (
                        <Path
                          key={index}
                          d={path}
                          stroke="#ffffff"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      ))}
                      {currentPath !== '' && (
                        <Path
                          d={currentPath}
                          stroke="#ffffff"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      )}
                    </Svg>
                  </View>
                </PanGestureHandler>
              </View>

              <Text style={styles.disclaimer}>*Your signature will not be recorded.</Text>
            </View>
          </View>
          {/* Confirm button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
            Platform.OS === 'ios' ? { marginTop: 15 } : null,
              { width: '50%' },
            !isSignaturePresent && styles.confirmButtonDisabled,
            Platform.OS === 'android' && { marginTop: 30 }
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleConfirm(); }}
            disabled={!isSignaturePresent}
          >
            <Text style={[styles.confirmButtonText, !isSignaturePresent && styles.confirmButtonTextDisabled]}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.select({ ios: 0, android: 30 }),
    marginTop: Platform.select({ ios: -50, android: -30 }),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
  header: {
    marginTop: 30,
    marginBottom: 32,
  },
  iconContainer: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 29,
    fontFamily: 'Cinzel',
    color: '#ffffff',
    marginBottom: 32,
    marginTop: -20,
    lineHeight: 34,
    paddingLeft: 20,
  },
  contractItems: {
    marginBottom: 48,
    paddingLeft: 20,
  },
  contractItem: {
    marginBottom: 16,
  },
  contractText: {
    fontSize: 14,
    fontFamily: 'Cinzel',
    color: '#ffffff',
    lineHeight: 19,
  },
  signatureContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    marginTop: Platform.select({ ios: -25, android: 0 }),
  },
  signatureLabel: {
    fontSize: 13,
    fontFamily: 'Cinzel',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    paddingLeft: 20,
  },
  signatureArea: {
    backgroundColor: '#000000',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    width: '100%',
  },
  canvas: {
    height: 190,
    width: '100%',
  },
  svg: {
    backgroundColor: '#000000',
    width: '100%',
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: 'Cinzel',
    color: '#ffffff',
    textAlign: 'center',
    paddingLeft: 20,
  },
  confirmButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.select({ ios: 0, android: 65 }),
    width: '50%',
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Cinzel',
  },
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
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonTextDisabled: {
    color: '#888888',
  },
}); 