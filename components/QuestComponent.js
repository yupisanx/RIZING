import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from './Icons';
import { theme } from '../utils/theme';
import { Timestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import ExerciseTable from './ExerciseTable';
import { QuestStates } from '../utils/questStateManager';

const { width, height } = Dimensions.get('window');
const NEON_COLOR = '#3b82f6';
const MODAL_HEIGHT = height * 0.65;

const QuestComponent = ({ 
  isVisible,
  questData,
  loading,
  error,
  countdownEnd,
  questState,
  onQuestComplete,
  onQuestFailure,
  onCooldownEnd,
  route
}) => {
  if (!isVisible) {
    return null;
  }

  const navigation = useNavigation();
  const [remainingTime, setRemainingTime] = useState('');
  const [completedExercises, setCompletedExercises] = useState({});
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [countdownActive, setCountdownActive] = useState(true);
  const [hasTriggeredEnd, setHasTriggeredEnd] = useState(false);
  const [rewards, setRewards] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (route?.params?.completedExercises) {
      setCompletedExercises(route.params.completedExercises);
      navigation.setParams({ completedExercises: undefined });
    }
  }, [route?.params?.completedExercises]);

  useEffect(() => {
    // Reset states when quest state changes
    setCountdownActive(true);
    setHasTriggeredEnd(false);
  }, [questState]);

  useEffect(() => {
    if (!countdownEnd) {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = countdownEnd.toDate();
      const difference = end - now;

      if (difference <= 0 && !hasTriggeredEnd) {
        setHasTriggeredEnd(true);
        setRemainingTime('00:00:00');
        setCountdownActive(false);
        
        if (questState === 'cooldown') {
          onCooldownEnd();
        } else if (questState === 'active') {
          setTimeout(() => {
            onQuestFailure();
          }, 1000);
        }
        return;
      }

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setRemainingTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [countdownEnd, questState, onCooldownEnd, onQuestFailure, hasTriggeredEnd]);

  const isQuestComplete = () => {
    if (!questData || !questData.exercises) return false;
    return questData.exercises.every(exercise => completedExercises[exercise.name]);
  };

  const animateFade = useCallback((toValue, callback) => {
    Animated.timing(fadeAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  }, [fadeAnim]);

  const handleCompleteQuest = async () => {
    if (isQuestComplete()) {
      setCountdownActive(false);
      const result = await onQuestComplete();
      if (result.success) {
        setRewards(result.rewards);
        animateFade(1, () => {
          setShowCompletionPopup(true);
        });
      }
    }
  };

  const handleClaimRewards = () => {
    animateFade(0, () => {
      setShowCompletionPopup(false);
      setCountdownActive(true);
    });
  };

  const handleExerciseComplete = (exerciseName) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  const renderContent = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Loading quest data...</Text>;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!questData) {
      return <Text style={styles.errorText}>No quest available</Text>;
    }

    return (
      <ExerciseTable
        exercises={questData.exercises}
        completedExercises={completedExercises}
        onExerciseComplete={handleExerciseComplete}
      />
    );
  };

  if (questState === QuestStates.COOLDOWN) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/assistant-avatar.png')}
          style={styles.assistantImage}
          resizeMode="contain"
        />
        <View style={[styles.modalContainer, styles.cooldownContainer]}>
          <View style={styles.glowEffect} />
          <View style={[styles.modal, styles.cooldownModal]}>
            <View style={styles.cooldownContent}>
              <Text style={styles.cooldownMessage}>
                My liege, your next quest unlocks in:
              </Text>
              <View style={styles.cooldownTimerContainer}>
                <Icons name="clock" size={32} color={NEON_COLOR} />
                <Text style={styles.cooldownTimer}>{remainingTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.speechBubbleTail} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.modalContainer}
        onPress={() => navigation.navigate('ExerciseTable', { 
          questData,
          initialCompletedExercises: completedExercises
        })}
        activeOpacity={0.8}
      >
        <View style={styles.glowEffect} />
        <View style={styles.modal}>
          <View style={styles.titleContainer}>
            <Icons name="info" size={24} color={NEON_COLOR} />
            <Text style={styles.messageText}>DAILY QUEST</Text>
          </View>

          <View style={styles.topBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.goalText}>GOAL</Text>
            {renderContent()}
          </View>

          <View style={styles.warningContainer}>
            <View style={styles.warningTextWrapper}>
              <View style={styles.warningFirstLine}>
                <Text style={styles.warningRedText}>WARNING</Text>
                <Text style={styles.warningWhiteText}> - FAILING TO COMPLETE THIS</Text>
              </View>
              <View style={styles.warningSecondLine}>
                <Text style={styles.warningWhiteText}>DAILY QUEST WILL BRING A </Text>
                <Text style={styles.warningRedText}>PENALTY</Text>
              </View>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <AntDesign name="clockcircle" size={20} color="#ffffff" style={styles.clockIcon} />
            <Text style={styles.timerText}>{remainingTime}</Text>
          </View>

          <View style={styles.bottomBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>
        </View>
      </TouchableOpacity>

      {isQuestComplete() && (
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleCompleteQuest}
        >
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>COMPLETE QUEST</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Modal
        visible={showCompletionPopup}
        transparent={true}
        animationType="fade"
      >
        <Animated.View style={[styles.popupOverlay, { opacity: fadeAnim }]}>
          <View style={styles.popupContainer}>
            <View style={styles.popupGlowEffect} />
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>🎉 Quest Complete!</Text>
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Icons name="star" size={24} color="#fbbf24" />
                  <Text style={styles.rewardText}>+{rewards?.xp || 0} XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Icons name="coin" size={24} color="#fbbf24" />
                  <Text style={styles.rewardText}>+{rewards?.coins || 0} Coins</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Icons name="stats" size={24} color="#fbbf24" />
                  <Text style={styles.rewardText}>+{rewards?.statPoints || 0} Stat Points</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.claimButton}
                onPress={handleClaimRewards}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.claimButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.claimButtonText}>CLAIM REWARDS</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: -35,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 500,
    height: MODAL_HEIGHT,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  modal: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: NEON_COLOR,
    borderRadius: 2,
    padding: 24,
    position: 'relative',
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    height: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginTop: -20,
    marginBottom: 5,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'PressStart2P',
    marginLeft: 10,
  },
  topBorderLine: {
    position: 'absolute',
    top: 45,
    left: 15,
    right: 15,
    height: 0.5,
    backgroundColor: NEON_COLOR,
    opacity: 1,
    zIndex: 2,
  },
  bottomBorderLine: {
    position: 'absolute',
    bottom: 120,
    left: 15,
    right: 15,
    height: 0.5,
    backgroundColor: NEON_COLOR,
    opacity: 1,
    zIndex: 2,
  },
  borderLineGlow: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    bottom: -3,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 40,
    paddingTop: 20,
  },
  exercisesContainer: {
    gap: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  exerciseName: {
    ...theme.typography.body,
    color: '#ffffff',
    flex: 1,
  },
  exerciseRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseTotal: {
    ...theme.typography.caption,
    color: NEON_COLOR,
    marginRight: 12,
  },
  loadingText: {
    ...theme.typography.body,
    color: NEON_COLOR,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: '#ef4444',
    textAlign: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: NEON_COLOR,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'transparent',
  },
  completedExercise: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  warningContainer: {
    position: 'absolute',
    bottom: 70,
    left: 15,
    right: 15,
    alignItems: 'center',
  },
  warningTextWrapper: {
    alignItems: 'center',
  },
  warningFirstLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningRedText: {
    ...theme.typography.caption,
    color: '#ef4444',
    fontSize: 9,
    lineHeight: 13,
  },
  warningWhiteText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontSize: 8,
    lineHeight: 11,
  },
  warningSecondLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
  },
  clockIcon: {
    marginRight: 12,
  },
  timerText: {
    ...theme.typography.h3,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 0,
    fontSize: 16,
  },
  completeButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 999,
  },
  completeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'PressStart2P',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.8,
    maxWidth: 400,
    position: 'relative',
  },
  popupGlowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 8,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  popupContent: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: NEON_COLOR,
    borderRadius: 6,
    padding: 24,
    alignItems: 'center',
  },
  popupTitle: {
    ...theme.typography.h1,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardText: {
    ...theme.typography.h3,
    color: '#ffffff',
    fontSize: 14,
  },
  claimButton: {
    width: '100%',
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButtonText: {
    ...theme.typography.h3,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
  },
  cooldownContainer: {
    width: width * 0.5,
    height: width * 0.35,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'visible',
    marginTop: -20,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  cooldownModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderWidth: 1.5,
    borderColor: NEON_COLOR,
    borderRadius: 16,
    padding: 15,
    position: 'relative',
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
    height: '100%',
    width: '100%',
  },
  cooldownContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingVertical: 7,
  },
  cooldownMessage: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PressStart2P',
    paddingHorizontal: 7,
  },
  cooldownTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cooldownTimer: {
    color: NEON_COLOR,
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: 22,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.9)',
    transform: [{ translateY: -3 }],
  },
  goalText: {
    ...theme.typography.h1,
    color: '#ffffff',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  assistantImage: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    opacity: 1,
    top: '60%',
    left: '50%',
    transform: [
      { translateX: -(width * 0.8) },
      { translateY: -(width * 0.8) }
    ],
    zIndex: 1,
  },
});

export default QuestComponent; 