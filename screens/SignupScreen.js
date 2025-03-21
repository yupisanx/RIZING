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
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
} from '../components/Icons';

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      // Navigation will be handled by the auth state listener
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000', 'rgba(88, 28, 135, 0.3)']}
        style={styles.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join us</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <UserIcon style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MailIcon style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <LockIcon style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}>
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#7e22ce', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <ArrowRightIcon />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.toggleButton}
                activeOpacity={0.7}>
                <View style={styles.toggleContent}>
                  <ChevronLeftIcon />
                  <Text style={styles.toggleText}>
                    <Text style={styles.toggleHighlight}>Sign In</Text> instead
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.divider} />
            <Text style={styles.footerText}>"I alone level up"</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#d8b4fe',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 50,
    position: 'relative',
  },
  input: {
    flex: 1,
    color: 'white',
    paddingLeft: 40,
    paddingRight: 40,
    height: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  toggleButton: {
    padding: 8,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    color: '#d8b4fe',
    fontSize: 14,
    marginLeft: 8,
  },
  toggleHighlight: {
    color: '#c084fc',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#a855f7',
    opacity: 0.3,
    marginBottom: 24,
  },
  footerText: {
    color: 'rgba(192, 132, 252, 0.6)',
    fontSize: 12,
  },
}); 