import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!username) {
      newErrors.username = 'Username is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signup(email, password, username);
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        style={styles.background}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Username"
                placeholderTextColor="#6b7280"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors({ ...errors, username: null });
                }}
                autoCapitalize="none"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#6b7280"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: null });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {errors.submit && (
              <Text style={[styles.errorText, styles.submitError]}>
                {errors.submit}
              </Text>
            )}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#000000',
    borderRadius: 15,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    shadowColor: '#60a5fa',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    ...theme.typography.h1,
    color: '#60a5fa',
    textAlign: 'center',
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#60a5fa',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  signupButton: {
    backgroundColor: '#60a5fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  signupButtonText: {
    ...theme.typography.h3,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    ...theme.typography.body,
    color: '#6b7280',
    fontSize: 14,
  },
  loginTextBold: {
    ...theme.typography.body,
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    ...theme.typography.caption,
    color: '#ef4444',
    marginBottom: 8,
  },
  submitError: {
    textAlign: 'left',
    marginBottom: 15,
    fontSize: 14,
    marginLeft: 5,
    marginTop: 0,
  },
}); 