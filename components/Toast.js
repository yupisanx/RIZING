import React, { useEffect } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Toast = ({ visible, message, type = 'success', onHide }) => {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.spring(translateY, {
        toValue: 50,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return ['#059669', '#10b981'];
      case 'error':
        return ['#dc2626', '#ef4444'];
      case 'info':
        return ['#7e22ce', '#a855f7'];
      default:
        return ['#059669', '#10b981'];
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}>
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}>
        <Text style={styles.message}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Toast; 