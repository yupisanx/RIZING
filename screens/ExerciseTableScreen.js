import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
  ScrollView,
  PanResponder,
  Alert,
} from 'react-native';
import { Icons } from '../components/Icons';
import { theme } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width } = Dimensions.get('window');
const IS_DEVELOPER_MODE = false; // Set this to false in production

const ExerciseTableScreen = ({ route }) => {
  const navigation = useNavigation();
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});
  const initialTime = useRef(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { questData } = route.params;
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(600)).current;
  const [isDeveloperMode, setIsDeveloperMode] = useState(IS_DEVELOPER_MODE);

  useEffect(() => {
    if (showTimer && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showTimer && timeLeft === 0 && currentExercise) {
      // Automatically mark exercise as complete when timer reaches 0
      setCompletedExercises(prev => ({
        ...prev,
        [currentExercise.name]: true
      }));
      resetBottomSheet();
    }
  }, [showTimer, timeLeft, isPaused, currentExercise]);

  useEffect(() => {
    if (showTimer) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showTimer, slideAnim]);

  const resetBottomSheet = () => {
    setShowTimer(false);
    setTimeLeft(0);
    initialTime.current = 0;
    setCurrentExercise(null);
    translateY.setValue(600);
    panY.setValue(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement or upward movement to original position
        const newPanY = Math.max(0, gestureState.dy);
        panY.setValue(newPanY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) { // Reduced threshold from 100 to 50
          // If dragged down more than 50 units, dismiss the sheet
          Animated.timing(translateY, {
            toValue: 600,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            resetBottomSheet();
          });
        } else {
          // Snap back to initial position
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset to initial position if gesture is interrupted
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      },
    })
  ).current;

  const handleExerciseStart = (exercise) => {
    setCurrentExercise(exercise);
    const exerciseTime = isDeveloperMode ? 5 : exercise.estimated_time_seconds;
    setTimeLeft(exerciseTime);
    initialTime.current = exerciseTime;
    setShowTimer(true);
    
    // Reset pan values before showing
    panY.setValue(0);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / initialTime.current;
  const circumference = 2 * Math.PI * 45;

  const renderExerciseCard = (exercise, index) => (
    <View key={index} style={styles.card}>
      <View style={styles.contentContainer}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.reps}>{exercise.total} Reps</Text>
          <Text style={styles.time}>{formatTime(exercise.estimated_time_seconds)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => {
          if (!completedExercises[exercise.name]) {
            Alert.alert(
              "Start Exercise",
              `This exercise will take approximately ${formatTime(exercise.estimated_time_seconds)}. Would you like to start?`,
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Start",
                  onPress: () => handleExerciseStart(exercise)
                }
              ]
            );
          }
        }}
        style={styles.iconContainer}
      >
        <AntDesign 
          name={completedExercises[exercise.name] ? "checksquare" : "checksquareo"} 
          size={31} 
          color={completedExercises[exercise.name] ? "#ffffff" : "#9CA3AF"} 
        />
      </TouchableOpacity>
    </View>
  );

  const isQuestComplete = () => {
    if (!questData?.exercises) return false;
    return questData.exercises.every(exercise => completedExercises[exercise.name]);
  };

  const handleCompleteQuest = () => {
    navigation.navigate('MainTabs', {
      screen: 'Quest',
      params: {
        completedExercises: completedExercises
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icons name="chevron-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise List</Text>
        {isDeveloperMode && (
          <TouchableOpacity 
            style={styles.devModeButton}
            onPress={() => {
              // Complete all exercises instantly
              const allExercises = questData.exercises.reduce((acc, exercise) => {
                acc[exercise.name] = true;
                return acc;
              }, {});
              setCompletedExercises(allExercises);
              Alert.alert(
                "Developer Mode",
                "All exercises completed!",
                [{ text: "OK" }]
              );
            }}
          >
            <Text style={styles.devModeText}>DEV: Complete All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.listContainer}>
        {questData?.exercises?.map((exercise, index) => 
          renderExerciseCard(exercise, index)
        )}
      </ScrollView>

      {!isQuestComplete() && (
        <TouchableOpacity 
          style={styles.testCheckboxContainer}
          onPress={() => {
            const allExercises = questData.exercises.reduce((acc, exercise) => {
              acc[exercise.name] = true;
              return acc;
            }, {});
            setCompletedExercises(allExercises);
          }}
        >
          <AntDesign 
            name="checksquareo" 
            size={40} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      )}

      {isQuestComplete() && (
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleCompleteQuest}
        >
          <Text style={styles.completeButtonText}>Complete Quest</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showTimer} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.bottomSheet,
              {
                transform: [
                  {
                    translateY: Animated.add(
                      translateY,
                      panY.interpolate({
                        inputRange: [0, 300],
                        outputRange: [0, 300],
                        extrapolate: 'clamp',
                      })
                    ),
                  },
                ],
              },
            ]}
          >
            <View style={styles.handle} />
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={() => {
                Animated.timing(translateY, {
                  toValue: 600,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  resetBottomSheet();
                });
              }}
            >
              <Icons name="x" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.timerContainer}>
              <View style={styles.circleContainer}>
                <Svg height="260" width="260" viewBox="0 0 100 100">
                  <Defs>
                    <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#0080ff" />
                      <Stop offset="100%" stopColor="#00b3ff" />
                    </LinearGradient>
                  </Defs>
                  <Circle cx="50" cy="50" r="45" stroke="#333333" strokeWidth="4" fill="none" />
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    transform="rotate(-90, 50, 50)"
                  />
                </Svg>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>

              <View style={styles.editTimerSection}>
                <View style={styles.timerButtonsContainer}>
                  <TouchableOpacity style={styles.timerButton} onPress={() => setIsPaused(!isPaused)}>
                    <Text style={styles.timerButtonText}>{isPaused ? "RESUME" : "PAUSE"}</Text>
                  </TouchableOpacity>
                  {isDeveloperMode && (
                    <TouchableOpacity 
                      style={[styles.timerButton, styles.fastForwardButton]} 
                      onPress={() => {
                        setTimeLeft(1);
                        initialTime.current = 1;
                      }}
                    >
                      <Text style={styles.timerButtonText}>FAST FORWARD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 12,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: 80,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: 'white',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reps: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#AAAAAA',
  },
  time: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#60a5fa',
  },
  iconContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderColor: '#333333',
    shadowColor: '#60a5fa',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#60a5fa',
      },
      android: {
        elevation: 50,
        shadowColor: '#60a5fa',
        shadowOpacity: 0.8,
        shadowRadius: 24,
        borderWidth: 0.4,
        borderColor: '#60a5fa',
        borderTopWidth: 0.4,
        borderLeftWidth: 0.4,
        borderRightWidth: 0.4,
        overflow: 'hidden',
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#60a5fa',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
    opacity: 0.8,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    marginTop: -20,
  },
  skipButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    zIndex: 1,
  },
  circleContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontFamily: 'PressStart2P',
    fontSize: 28,
    color: 'white',
    position: 'absolute',
  },
  editTimerSection: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  timerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#000000',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
    width: 200,
  },
  timerButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: 'white',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  completeButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: 'white',
  },
  devModeButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  devModeText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ffffff',
  },
  fastForwardButton: {
    backgroundColor: '#ef4444',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testCheckboxContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
});

export default ExerciseTableScreen; 