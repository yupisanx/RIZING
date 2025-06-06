import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import Checkbox from 'expo-checkbox';

const StartScreenn = ({ navigation, onClose }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Image 
          source={require('../assets/brand-icon.png')} 
          style={styles.brandIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>MC APP</Text>
        <View style={styles.checkboxRow}>
          <Checkbox
            value={agreed}
            onValueChange={setAgreed}
            color={agreed ? '#3B82F6' : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxText}>
            I agree to the{' '}
            <Text
              style={[styles.link, { color: '#3B82F6' }]}
              onPress={() => Linking.openURL('https://phantom.app/terms')}
            >
              Terms of Service
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: agreed ? '#3B82F6' : '#444' }]}
          disabled={!agreed}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Create a new account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.disabledText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  centered: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative',
  },
  brandIcon: {
    width: 276,
    height: 276,
    position: 'absolute',
    top: -320,
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: -80,
    fontFamily: 'Cinzel',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Cinzel',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
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
    fontFamily: 'Cinzel',
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Cinzel',
  },
  disabledText: {
    color: '#888',
    fontSize: 16,
    fontFamily: 'Cinzel',
  },
  checkbox: {
    borderRadius: 8,
  },
});

export default StartScreenn; 