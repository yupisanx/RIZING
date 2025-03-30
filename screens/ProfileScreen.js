import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Icons } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import MessageModal from '../components/MessageModal';

const SCREEN_PADDING = 20;
const HEADER_HEIGHT = 90;
const STATUS_BAR_HEIGHT = Platform.select({
  ios: 0,
  android: 24,
});

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const AVATAR_HEIGHT = width * 1.26;

  // Calculate responsive avatar margin
  const avatarMarginTop = useMemo(() => {
    const baseMargin = Platform.OS === 'ios' ? -280 : -height * 0.35;
    const deviceScale = height / 844; // iPhone 14 Pro height as reference
    return baseMargin * deviceScale;
  }, [height]);

  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const navigation = useNavigation();

  // Initialize animation value
  useEffect(() => {
    slideAnim.setValue(width);
  }, [width]);

  const toggleMenu = useCallback(() => {
    const toValue = menuVisible ? width : 0;
    setMenuVisible(!menuVisible);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  }, [menuVisible, slideAnim, width]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setError(null);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!isMounted) return;

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
        } else {
          setError('User data not found');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, styles.errorText]}>{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>No user data available</Text>
      </View>
    );
  }

  const avatarSource = userData.gender === 'male' 
    ? require('../assets/avatars/male-avatar.png')
    : require('../assets/avatars/female-avatar.png');

  return (
    <View style={styles.container}>
      {/* Header Icons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMessageModal(true)}
          accessibilityLabel="Open messages"
        >
          <Icons name="mail" size={28} color="#d8b4fe" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleMenu}
          accessibilityLabel="Open menu"
        >
          <Icons name="menu" size={28} color="#d8b4fe" />
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
            width: width * 0.75
          }
        ]}>
        <View style={styles.menuContent}>
          <View style={styles.menuHeader}>
            <Icons name="user" size={24} color="#d8b4fe" />
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
            }}
            accessibilityLabel="Logout"
          >
            <Icons name="log-out" size={20} color="#d8b4fe" />
            <Text style={styles.menuItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
      >
        <View style={[styles.mainContent, { minHeight: height * 0.8, marginTop: Platform.OS === 'android' ? -STATUS_BAR_HEIGHT : 0 }]}>
          <Image
            source={avatarSource}
            style={[styles.avatar, { width, height: AVATAR_HEIGHT, marginTop: avatarMarginTop }]}
            resizeMode="contain"
            accessibilityLabel={`${userData.gender} avatar`}
          />
        </View>

        <View style={[styles.extraSpace, { height: height * 0.2 }]} />
      </ScrollView>

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
    backgroundColor: '#000000',
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
    padding: 12,
  },
  menuButton: {
    padding: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    resizeMode: 'contain',
  },
  extraSpace: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#000000',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(216, 180, 254, 0.3)',
    zIndex: 2,
    elevation: 5,
  },
  menuContent: {
    padding: 20,
    marginTop: 60,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 180, 254, 0.1)',
    marginBottom: 20,
  },
  userInfo: {
    marginLeft: 12,
  },
  menuUsername: {
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuEmail: {
    color: '#d8b4fe',
    fontSize: 14,
    opacity: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuItemText: {
    color: '#d8b4fe',
    fontSize: 16,
    marginLeft: 12,
  },
  errorText: {
    color: '#ff6b6b',
  },
});