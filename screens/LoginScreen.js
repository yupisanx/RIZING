import React, { useState, useEffect } from 'react';
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
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorHandler from '../utils/errorHandler';
import styles from '../styles/styles';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword, user, loading: authLoading } = useAuth();

  // Keep showing login screen until auth is fully ready
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', flex: 1, backgroundColor: '#000000' }]}>
          <View style={[styles.formContainer, { flex: 1, justifyContent: 'center', backgroundColor: '#000000' }]}>
            <ActivityIndicator size="large" color="#60a5fa" />
            <Text style={[styles.loadingText, { color: '#fff', marginTop: 20, fontFamily: 'Cinzel' }]}>
              Loading your data...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Don't set loading to false here - let AuthContext handle it
    } catch (error) {
      setLoading(false); // Only set loading to false on error
      ErrorHandler.showAlert(error, 'Login');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    } catch (error) {
      ErrorHandler.showAlert(error, 'Password Reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', flex: 1, backgroundColor: '#000000' }]}>
        {/* Form */}
        <View style={[styles.formContainer, { flex: 1, justifyContent: 'center', backgroundColor: '#000000' }]}>
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

          {/* Forgot Password */}
          <TouchableOpacity 
            style={[styles.forgotPassword, { marginTop: 0, marginBottom: 0, alignSelf: 'flex-end' }]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={[styles.forgotPasswordText, { fontFamily: 'Cinzel' }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.actionButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={[styles.actionButtonText, { fontFamily: 'Cinzel' }]}>Login</Text>
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

          {/* Sign Up Prompt */}
          <View style={styles.signupPrompt}>
            <Text style={[styles.signupText, { fontFamily: 'Cinzel' }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.signupLink, { fontFamily: 'Cinzel' }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen; 