import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrainingScreen() {
  return (
    <LinearGradient
      colors={['#0284c7', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.text}>Training Screen</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
  },
}); 