import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const NEON_COLOR = '#3b82f6'; // Blue
const SHADOW_COLOR = 'rgba(59, 130, 246, 0.8)';

const MessageModal = ({ visible, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
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

            {/* Content area */}
            <View style={styles.contentArea}>
              <View style={styles.content}>
                {/* Content will be added here if needed */}
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

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
  touchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.75,
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
});

export default MessageModal; 