import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';
import { isTablet, isDesktop, getContainerWidth, platformSelect } from '../utils/responsive';
import NeonModal from '../components/NeonModal';
import MessageModal from '../components/MessageModal';

const { width } = Dimensions.get('window');

export default function QuestScreen() {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [questModalVisible, setQuestModalVisible] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  const toggleMenu = () => {
    const toValue = menuVisible ? width : 0;
    setMenuVisible(!menuVisible);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  };

  const handleQuestAccept = () => {
    setQuestModalVisible(false);
    // Add your quest acceptance logic here
    console.log('Quest accepted');
  };

  const handleQuestDecline = () => {
    setQuestModalVisible(false);
    // Add your quest decline logic here
    console.log('Quest declined');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMessageModal(true)}>
          <Icons name="mail" size={isTablet ? 32 : 28} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleMenu}>
          <Icons name="menu" size={isTablet ? 32 : 28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Sliding Menu */}
      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
            width: isTablet ? width * 0.5 : width * 0.75,
          }
        ]}>
        <View style={styles.menuContent}>
          <View style={styles.menuHeader}>
            <Icons name="user" size={isTablet ? 28 : 24} color={theme.colors.primary} />
            <View style={styles.userInfo}>
              <Text style={styles.menuUsername}>{user?.displayName || 'User'}</Text>
              <Text style={styles.menuEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              logout();
            }}>
            <Icons name="log-out" size={isTablet ? 24 : 20} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.text}>Quest Screen</Text>
      </View>

      <NeonModal
        isVisible={questModalVisible}
        description="Embark on a journey to master your strength and agility. Are you ready to accept this challenge?"
        onAccept={handleQuestAccept}
        onDecline={handleQuestDecline}
        acceptText="ACCEPT"
        declineText="DECLINE"
      />

      {/* Mail Message Modal */}
      <MessageModal
        visible={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...theme.layout.container,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: 10,
  },
  iconButton: {
    padding: theme.spacing.md,
  },
  menuButton: {
    padding: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    backgroundColor: theme.colors.background,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    zIndex: 2,
    elevation: 5,
  },
  menuContent: {
    padding: theme.spacing.xl,
    marginTop: platformSelect({
      ios: theme.spacing.xxl,
      android: theme.spacing.xl,
      default: theme.spacing.xxl,
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  userInfo: {
    marginLeft: theme.spacing.md,
  },
  menuUsername: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  menuEmail: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    opacity: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  menuItemText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.md,
  },
}); 