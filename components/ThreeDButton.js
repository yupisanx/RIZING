import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ThreeDButton = ({ onPress, size = 48, completed = false }) => {
  return (
    <View style={styles.container}>
      {/* 3D shadow effect at bottom */}
      <View style={[styles.shadow, { width: size, height: size }]} />
      
      {/* Main button */}
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Icon name="check" size={size * 0.5} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 0,
    backgroundColor: '#4B5563', // Dark grey for shadow
    borderRadius: 12,
    zIndex: 0,
  },
  button: {
    position: 'relative',
    backgroundColor: '#9CA3AF', // Light grey for main button
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
});

export default ThreeDButton; 