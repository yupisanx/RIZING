import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Icons } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import MessageModal from '../components/MessageModal';
import BottomSheet from '../components/BottomSheet';

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
  const navigation = useNavigation();
  const { toggleMenu, logout } = useMenu();

  // Calculate responsive avatar margin
  const avatarMarginTop = useMemo(() => {
    const baseMargin = Platform.OS === 'ios' ? -280 : -height * 0.35;
    const deviceScale = height / 844; // iPhone 14 Pro height as reference
    return baseMargin * deviceScale;
  }, [height]);

  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const isMounted = useRef(true);
  const navigationTimeoutRef = useRef(null);
  const lastToggleTime = useRef(Date.now());
  const MIN_TOGGLE_INTERVAL = 300; // Minimum time between toggles in ms
  const isAnimating = useRef(false);

  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const safeSetBottomSheetVisible = (visible) => {
    const now = Date.now();
    const timeSinceLastToggle = now - lastToggleTime.current;

    // If we're animating or toggling too quickly, queue the change
    if (isAnimating.current || timeSinceLastToggle < MIN_TOGGLE_INTERVAL) {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      navigationTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          lastToggleTime.current = Date.now();
          setIsBottomSheetVisible(visible);
        }
      }, MIN_TOGGLE_INTERVAL);
      return;
    }

    // Otherwise, update immediately
    lastToggleTime.current = now;
    setIsBottomSheetVisible(visible);
  };

  useEffect(() => {
    const handleFocus = () => {
      safeSetBottomSheetVisible(true);
    };

    const handleBlur = () => {
      // Only hide if we've been visible for at least MIN_TOGGLE_INTERVAL
      const timeSinceLastToggle = Date.now() - lastToggleTime.current;
      if (timeSinceLastToggle >= MIN_TOGGLE_INTERVAL) {
        safeSetBottomSheetVisible(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', handleFocus);
    const blurUnsubscribe = navigation.addListener('blur', handleBlur);

    // Show bottom sheet initially if screen is focused
    if (navigation.isFocused()) {
      handleFocus();
    }

    return () => {
      unsubscribe();
      blurUnsubscribe();
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [navigation]);

  useEffect(() => {
    let isSubscribed = true;
    let unsubscribe;

    const setupRealtimeUpdates = async () => {
      if (!user?.uid) return;

      try {
        setError(null);
        // Set up real-time listener
        unsubscribe = onSnapshot(doc(db, 'users', user.uid), 
          (doc) => {
            if (!isSubscribed) return;
            
            if (doc.exists()) {
              const data = doc.data();
              console.log('Real-time update received:', data);
              setUserData(data);
            } else {
              setError('User data not found');
            }
            setLoading(false);
          },
          (error) => {
            if (!isSubscribed) return;
            console.error('Error in real-time updates:', error);
            setError('Failed to load user data');
            setLoading(false);
          }
        );
      } catch (error) {
        if (!isSubscribed) return;
        console.error('Error setting up real-time updates:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    setupRealtimeUpdates();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  const handleBottomSheetClose = () => {
    if (isMounted.current) {
      safeSetBottomSheetVisible(false);
    }
  };

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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Re-fetch user data
            const fetchUserData = async () => {
              try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                  setUserData(userDoc.data());
                } else {
                  setError('User data not found');
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data');
              } finally {
                setLoading(false);
              }
            };
            fetchUserData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          <Icons name="mail" size={28} color="#60a5fa" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleMenu}
          accessibilityLabel="Open menu"
        >
          <Icons name="menu" size={28} color="#60a5fa" />
        </TouchableOpacity>
      </View>

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

      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={handleBottomSheetClose}
        initialSnapPoint={0}
        onAnimationStart={() => {
          isAnimating.current = true;
        }}
        onAnimationEnd={() => {
          isAnimating.current = false;
        }}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.infoContainer}>
            <Icons name="info" size={24} color="#60a5fa" />
            <Text style={styles.bottomSheetTitle}>INFO</Text>
          </View>

          <View style={styles.userDataContainer}>
            {/* Stats */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Stats</Text>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Class:</Text>
                <Text style={styles.value}>{userData?.class || 'N/A'}</Text>
              </View>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Strength:</Text>
                <Text style={styles.value}>{userData?.stats?.strength || '0'}</Text>
              </View>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Vitality:</Text>
                <Text style={styles.value}>{userData?.stats?.vitality || '0'}</Text>
              </View>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Agility:</Text>
                <Text style={styles.value}>{userData?.stats?.agility || '0'}</Text>
              </View>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Intelligence:</Text>
                <Text style={styles.value}>{userData?.stats?.intelligence || '0'}</Text>
              </View>
              <View style={styles.userDataRow}>
                <Text style={styles.label}>Sense:</Text>
                <Text style={styles.value}>{userData?.stats?.sense || '0'}</Text>
              </View>
            </View>

            {/* Focus Areas */}
            <View style={[styles.sectionContainer, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Area</Text>
              <View style={styles.userDataRow}>
                <Text style={styles.value}>{userData?.focusArea || 'None selected'}</Text>
              </View>
            </View>
          </View>
        </View>
      </BottomSheet>
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
  errorText: {
    color: '#ff6b6b',
  },
  retryButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  bottomSheetTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userDataContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(96, 165, 250, 0.3)',
    paddingBottom: 10,
  },
  lastSection: {
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  userDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  value: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
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
    borderBottomColor: 'rgba(96, 165, 250, 0.1)',
    marginBottom: 20,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  menuUsername: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emailLabel: {
    color: '#60a5fa',
    fontSize: 14,
    opacity: 0.8,
  },
  menuEmail: {
    color: '#60a5fa',
    fontSize: 14,
    opacity: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuItemText: {
    color: '#60a5fa',
    fontSize: 16,
    marginLeft: 12,
  },
});