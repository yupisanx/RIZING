import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from './Icons';

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
  onCooldownEnd
}) => {
  if (!isVisible) {
    return null;
  }

  const [remainingTime, setRemainingTime] = useState('');
  const [completedExercises, setCompletedExercises] = useState({});
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [countdownActive, setCountdownActive] = useState(true);

  useEffect(() => {
    // Reset countdown active state when quest state changes
    setCountdownActive(true);
  }, [questState]);

  useEffect(() => {
    if (!countdownEnd) return;

    let hasTriggered = false; // Add flag to prevent multiple triggers

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = countdownEnd.toDate();
      const difference = end - now;

      if (difference <= 0 && !hasTriggered) {
        hasTriggered = true; // Set flag to prevent multiple triggers
        setRemainingTime('00:00:00');
        setCountdownActive(false);
        
        // Handle quest state transition
        if (questState === 'cooldown') {
          onCooldownEnd();
        } else if (questState === 'active') {
          // Add a small delay before triggering quest failure
          setTimeout(() => {
            onQuestFailure();
          }, 1000);
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setRemainingTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Calculate immediately to avoid delay
    calculateTimeLeft();

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(interval);
      hasTriggered = false; // Reset flag on cleanup
    };
  }, [countdownEnd, questState, onCooldownEnd, onQuestFailure]);

  const toggleExercise = (exerciseName) => {
    if (questState === 'cooldown') return;
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  const isQuestComplete = () => {
    if (!questData || !questData.exercises) return false;
    return questData.exercises.every(exercise => completedExercises[exercise.name]);
  };

  const handleCompleteQuest = () => {
    if (isQuestComplete()) {
      setCountdownActive(false);
      setShowCompletionPopup(true);
    }
  };

  const handleClaimRewards = () => {
    setShowCompletionPopup(false);
    setCountdownActive(true); // Reset countdown active state
    onQuestComplete();
  };

  const renderExercise = (exercise, index) => (
    <View key={index} style={styles.exerciseRow}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleExercise(exercise.name)}
        disabled={questState === 'cooldown'}
      >
        <View style={[
          styles.checkboxInner,
          completedExercises[exercise.name] && styles.checkboxChecked
        ]}>
          {completedExercises[exercise.name] && (
            <Icons name="check" size={16} color="#3b82f6" />
          )}
        </View>
      </TouchableOpacity>
      <Text style={[
        styles.exerciseName,
        completedExercises[exercise.name] && styles.completedExercise
      ]}>
        {exercise.name}
      </Text>
      <Text style={[
        styles.exerciseTotal,
        completedExercises[exercise.name] && styles.completedExercise
      ]}>
        [{completedExercises[exercise.name] ? exercise.total : 0}/{exercise.total}]
      </Text>
    </View>
  );

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
      <View style={styles.exercisesContainer}>
        {questData.exercises.map((exercise, index) => 
          renderExercise(exercise, index)
        )}
      </View>
    );
  };

  if (questState === 'cooldown') {
    return (
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <View style={styles.glowEffect} />
          <View style={styles.modal}>
            <View style={styles.titleContainer}>
              <Icons name="info" size={24} color={NEON_COLOR} />
              <Text style={styles.messageText}>QUEST COOLDOWN</Text>
            </View>

            <View style={styles.topBorderLine}>
              <View style={styles.borderLineGlow} />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.cooldownMessage}>
                My liege, your next quest unlocks in:
              </Text>
              <View style={styles.cooldownTimerContainer}>
                <Icons name="clock" size={32} color={NEON_COLOR} />
                <Text style={styles.cooldownTimer}>{remainingTime}</Text>
              </View>
            </View>

            <View style={styles.bottomBorderLine}>
              <View style={styles.borderLineGlow} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
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
            {renderContent()}
          </View>

          <View style={styles.warningContainer}>
            <View style={styles.warningTextWrapper}>
              <View style={styles.warningFirstLine}>
                <Text style={styles.warningRedText}>WARNING</Text>
                <Text style={styles.warningWhiteText}> - FAILING TO COMPLETE</Text>
              </View>
              <Text style={styles.warningWhiteText}>THIS DAILY QUEST WILL BRING A PENALTY</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Icons name="clock" size={20} color="#ffffff" style={styles.clockIcon} />
            <Text style={styles.timerText}>{remainingTime}</Text>
          </View>

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

          <View style={styles.bottomBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>
        </View>
      </View>

      <Modal
        visible={showCompletionPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupGlowEffect} />
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>🎉 Quest Complete!</Text>
              <View style={styles.rewardsContainer}>
                <View style={styles.rewardItem}>
                  <Icons name="star" size={24} color="#fbbf24" />
                  <Text style={styles.rewardText}>+100 XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <Icons name="coin" size={24} color="#fbbf24" />
                  <Text style={styles.rewardText}>+100 Coins</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.claimButton}
                onPress={handleClaimRewards}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.claimButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.claimButtonText}>Claim Rewards</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 4,
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
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  messageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topBorderLine: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    height: 0.5,
    backgroundColor: NEON_COLOR,
    opacity: 1,
    zIndex: 2,
  },
  bottomBorderLine: {
    position: 'absolute',
    bottom: 100,
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
    flex: 1,
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 80,
  },
  exercisesContainer: {
    gap: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exerciseTotal: {
    color: NEON_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: NEON_COLOR,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 12,
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
    backgroundColor: '#ffffff',
  },
  completedExercise: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  warningContainer: {
    position: 'absolute',
    bottom: 55,
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
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  warningWhiteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  clockIcon: {
    marginRight: 5,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  completeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cooldownMessage: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  cooldownTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cooldownTimer: {
    color: NEON_COLOR,
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default QuestComponent; 