import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorHandler from '../utils/errorHandler';
import styles from '../styles/styles';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      ErrorHandler.showAlert({ message: 'Please fill in all fields' });
      return;
    }

    if (password.length < 6) {
      ErrorHandler.showAlert({ message: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, username);
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      ErrorHandler.showAlert(error, 'Signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', flex: 1 }]}>
        {/* Form */}
        <View style={[styles.formContainer, { flex: 1, justifyContent: 'center' }]}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { fontFamily: 'Cinzel' }]}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
            <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { fontFamily: 'Cinzel' }]}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { fontFamily: 'Cinzel' }]}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.actionButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={[styles.actionButtonText, { fontFamily: 'Cinzel' }]}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={[styles.socialText, { fontFamily: 'Cinzel' }]}>Or sign in with:</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]} disabled={loading}>
                <Ionicons name="logo-apple" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]} disabled={loading}>
                <Ionicons name="logo-google" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Prompt */}
          <View style={styles.signupPrompt}>
            <Text style={[styles.signupText, { fontFamily: 'Cinzel' }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={[styles.signupLink, { fontFamily: 'Cinzel' }]}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignupScreen; 