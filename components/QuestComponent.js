import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from './Icons';

const { width, height } = Dimensions.get('window');

const QuestComponent = ({ 
  isVisible,
  questData,
  loading,
  error
}) => {
  if (!isVisible) {
    return null;
  }

  const renderExercise = (exercise, index) => (
    <View key={index} style={styles.exerciseRow}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseTotal}>[0/{exercise.total}]</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        {/* Outer glow effect */}
        <View style={styles.glowEffect} />

        {/* Main modal */}
        <View style={styles.modal}>
          {/* Message text above border line */}
          <View style={styles.titleContainer}>
            <Icons name="info" size={24} color="#3b82f6" />
            <Text style={styles.messageText}>DAILY QUEST</Text>
          </View>

          {/* Top border line */}
          <View style={styles.topBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>

          {/* Content area */}
          <View style={styles.contentContainer}>
            {renderContent()}
          </View>

          {/* Warning text */}
          <View style={styles.warningContainer}>
            <View style={styles.warningTextWrapper}>
              <View style={styles.warningFirstLine}>
                <Text style={styles.warningRedText}>WARNING</Text>
                <Text style={styles.warningWhiteText}> - FAILING TO COMPLETE</Text>
              </View>
              <Text style={styles.warningWhiteText}>THIS DAILY QUEST WILL BRING A PENALTY</Text>
            </View>
          </View>

          {/* Bottom border line */}
          <View style={styles.bottomBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>
        </View>
      </View>
    </View>
  );
};

const NEON_COLOR = '#3b82f6'; // Blue
const MODAL_HEIGHT = height * 0.65; // Increased from 0.6 to 0.65 (65% of screen height)

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
});

export default QuestComponent; 