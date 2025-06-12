import React from 'react';
import { View, StyleSheet } from 'react-native';

const Sparkle = ({ style }) => {
  return (
    <View style={[styles.sparkle, style]}>
      <View style={styles.sparkleInner} />
    </View>
  );
};

const styles = StyleSheet.create({
  sparkle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ rotate: '45deg' }],
  },
  sparkleInner: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    top: 1,
    left: 1,
  },
});

export default Sparkle; 