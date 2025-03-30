import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OnboardingCard = ({ 
  title, 
  description, 
  children, 
  onNext, 
  onBack, 
  currentStep, 
  totalSteps,
  style,
  hideProgress = true
}) => {
  return (
    <View style={[styles.container, style]}>
      {!hideProgress && (
        <>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
          </View>

          {/* Step indicator */}
          <Text style={styles.stepIndicator}>STEP {currentStep}/{totalSteps}</Text>
        </>
      )}

      {/* Header */}
      <View style={[styles.header, hideProgress && styles.headerNoProgress]}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>SELECT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 1.5,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6d28d9',
    borderRadius: 1.5,
  },
  stepIndicator: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 0,
    alignItems: 'center',
  },
  headerNoProgress: {
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 0,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '80%',
  },
  content: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  nextButton: {
    width: width - 160,
    height: 56,
    backgroundColor: '#6d28d9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default OnboardingCard; 