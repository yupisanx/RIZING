import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const NeonModal = ({ 
  isVisible, 
  onAccept, 
  onDecline, 
  title = '', 
  description = '', 
  acceptText = 'Accept', 
  declineText = 'Decline' 
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        {/* Outer glow effect */}
        <View style={styles.glowEffect} />

        {/* Main modal */}
        <View style={styles.modal}>
          {/* Message text above border line */}
          <Text style={styles.messageText}>Message</Text>

          {/* Top border line */}
          <View style={styles.topBorderLine}>
            <View style={styles.borderLineGlow} />
          </View>

          {/* Content area with corner brackets */}
          <View style={styles.contentArea}>
            {/* Top-left corner bracket */}
            <View style={styles.topLeftBracket}>
              <View style={styles.horizontalBracketLine} />
              <View style={styles.verticalBracketLine} />
              <View style={styles.bracketGlow} />
            </View>

            {/* Top-right corner bracket */}
            <View style={styles.topRightBracket}>
              <View style={[styles.horizontalBracketLine, styles.rightLine]} />
              <View style={[styles.verticalBracketLine, styles.rightLine]} />
              <View style={styles.bracketGlow} />
            </View>

            {/* Bottom-left corner bracket */}
            <View style={styles.bottomLeftBracket}>
              <View style={[styles.horizontalBracketLine, styles.bottomLine]} />
              <View style={styles.verticalBracketLine} />
              <View style={styles.bracketGlow} />
            </View>

            {/* Bottom-right corner bracket */}
            <View style={styles.bottomRightBracket}>
              <View style={[styles.horizontalBracketLine, styles.rightLine, styles.bottomLine]} />
              <View style={[styles.verticalBracketLine, styles.rightLine]} />
              <View style={styles.bracketGlow} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {description && <Text style={styles.description}>{description}</Text>}
            </View>
          </View>

          {/* Buttons container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={onAccept}>
              <LinearGradient colors={['rgba(138,43,226,0.1)', 'rgba(138,43,226,0.2)']} style={styles.buttonGradient} />
              <View style={styles.buttonBorder} />
              <Text style={styles.buttonText}>{acceptText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onDecline}>
              <LinearGradient colors={['rgba(138,43,226,0.1)', 'rgba(138,43,226,0.2)']} style={styles.buttonGradient} />
              <View style={styles.buttonBorder} />
              <Text style={styles.buttonText}>{declineText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const NEON_COLOR = '#8a2be2'; // Blueviolet
const SHADOW_COLOR = 'rgba(138,43,226,0.8)';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 500,
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
  },
  topBorderLine: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    height: 0.2,
    backgroundColor: NEON_COLOR,
    opacity: 0.8,
  },
  borderLineGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    bottom: -1,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  contentArea: {
    marginTop: 40,
    marginBottom: 20,
    minHeight: 180,
    position: 'relative',
    paddingBottom: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  topLeftBracket: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 10,
    height: 10,
  },
  topRightBracket: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 10,
    height: 10,
  },
  bottomLeftBracket: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    width: 10,
    height: 10,
  },
  bottomRightBracket: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 10,
    height: 10,
  },
  horizontalBracketLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 1,
    backgroundColor: NEON_COLOR,
  },
  verticalBracketLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 10,
    backgroundColor: NEON_COLOR,
  },
  rightLine: {
    right: 0,
    left: 'auto',
  },
  bottomLine: {
    bottom: 0,
    top: 'auto',
  },
  bracketGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  button: {
    width: 120,
    height: 35,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: NEON_COLOR,
    shadowColor: NEON_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});

export default NeonModal; 