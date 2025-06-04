import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Checkbox from 'expo-checkbox';

const PhantomStartScreen = ({ navigation, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.title}>Welcome to Phantom</Text>
        <Text style={styles.subtitle}>
          To get started, create a new wallet or import an existing one.
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
        </View>
        <View style={styles.checkboxRow}>
          <Checkbox
            value={agreed}
            onValueChange={setAgreed}
            color={agreed ? '#a259ff' : undefined}
          />
          <Text style={styles.checkboxText}>
            I agree to the{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('https://phantom.app/terms')}
            >
              Terms of Service
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: agreed ? '#a259ff' : '#444' }]}
          disabled={!agreed}
        >
          <Text style={styles.buttonText}>Create a new wallet</Text>
        </TouchableOpacity>
        <Text style={styles.disabledText}>I already have a wallet</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a259ff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  link: {
    color: '#a259ff',
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    color: '#888',
    fontSize: 16,
  },
});

export default PhantomStartScreen; 