import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  return (
    <LinearGradient
      colors={['#0284c7', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.email}>Email: {user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 