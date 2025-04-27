import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { Icons } from './Icons';
import { useMenu } from '../contexts/MenuContext';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function Menu() {
  const { menuVisible, toggleMenu, slideAnim } = useMenu();
  const { user, logout } = useAuth();

  if (!menuVisible) return null;

  return (
    <>
      <View style={styles.overlay} />
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}>
        <View style={styles.menuContent}>
          <View style={styles.menuHeader}>
            <TouchableOpacity 
              onPress={toggleMenu}
              style={styles.backButton}
              accessibilityLabel="Back to app"
            >
              <Icons name="chevron-left" size={24} color="#60a5fa" />
            </TouchableOpacity>
            <Text style={styles.menuTitle}>MENU</Text>
          </View>

          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              toggleMenu();
              logout();
            }}
            accessibilityLabel="Logout"
          >
            <Text style={styles.logoutText}>Logout</Text>
            <Icons name="logout" size={20} color="#60a5fa" style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999998,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: '#000000',
    zIndex: 999999,
  },
  menuContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 180, 254, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  menuTitle: {
    ...theme.typography.h2,
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    marginRight: 48,
  },
  emailContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 180, 254, 0.1)',
  },
  emailText: {
    ...theme.typography.body,
    color: '#60a5fa',
    opacity: 0.9,
  },
  logoutButton: {
    marginTop: 'auto',
    marginBottom: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 180, 254, 0.1)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoutText: {
    ...theme.typography.body,
    color: '#60a5fa',
    fontWeight: '500',
    marginRight: 12,
  },
  logoutIcon: {
    marginLeft: 4,
  },
}); 