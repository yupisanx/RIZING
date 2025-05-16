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
import Tab from '../components/common/Tab';
import RadarChart from '../components/common/RadarChart';
import { theme } from '../utils/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const SCREEN_PADDING = 20;
const HEADER_HEIGHT = Platform.select({
  ios: 35,
  android: 50,
});
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
    const baseMargin = Platform.OS === 'ios' ? -190 : -height * 0.35 + 180;
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
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Info', 'Stats', 'Inventory'];

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

  const renderStatsChart = () => {
    const data = {
      labels: ['STR', 'VIT', 'AGI', 'INT', 'SEN'],
      datasets: [
        {
          data: [
            userData?.stats?.strength || 0,
            userData?.stats?.vitality || 0,
            userData?.stats?.agility || 0,
            userData?.stats?.intelligence || 0,
            userData?.stats?.sense || 0,
          ],
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <RadarChart data={data} size={width - 40} color="#60a5fa" />
        <View style={styles.statsContainer}>
          <Text style={styles.statPointsLabel}>STAT POINTS</Text>
          <Text style={styles.statPointsValue}>{userData?.statPoints || 0}</Text>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Info
        return (
          <View style={styles.tabContent}>
            <View style={styles.userDataRow}>
              <Text style={styles.label}>Level:</Text>
              <Text style={styles.value}>{userData?.level || '1'}</Text>
            </View>
            <View style={styles.userDataRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.value}>{userData?.class || 'N/A'}</Text>
            </View>
            <View style={styles.userDataRow}>
              <Text style={styles.label}>Focus Area:</Text>
              <Text style={styles.value}>{userData?.focusArea || 'None selected'}</Text>
            </View>
            <View style={styles.userDataRow}>
              <Text style={styles.label}>Training Frequency:</Text>
              <Text style={styles.value}>{userData?.frequency || 'N/A'}</Text>
            </View>
            <View style={styles.userDataRow}>
              <Text style={styles.label}>Streak:</Text>
              <Text style={styles.value}>{userData?.streak || '0'} days</Text>
            </View>
          </View>
        );
      case 1: // Stats
        return (
          <View style={styles.tabContent}>
            {renderStatsChart()}
          </View>
        );
      case 2: // Inventory
        return (
          <View style={styles.tabContent}>
            <View style={styles.inventoryContainer}>
              <View style={styles.coinsRow}>
                <FontAwesome5 name="coins" size={20} color="#60a5fa" />
                <Text style={styles.coinsValue}>{userData?.coins || '0'}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
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
          style={styles.menuButton}
          onPress={() => navigation.navigate('Menu')}
          accessibilityLabel="Open menu"
        >
          <Icons name="menu" size={34} color="#60a5fa" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMessageModal(true)}
          accessibilityLabel="Open messages"
        >
          <Icons name="mail" size={34} color="#60a5fa" />
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
          <View style={styles.usernameContainer}>
            <View style={styles.usernameWrapper}>
              <Ionicons name="settings" size={Platform.OS === 'android' ? 24 : 20} color="#60a5fa" />
              <Text style={styles.username}>{user?.displayName || 'User'}</Text>
            </View>
          </View>
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
          <Tab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <ScrollView style={styles.tabContent}>
            {renderTabContent()}
          </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? 35 : 15,
    paddingBottom: Platform.OS === 'android' ? 7.5 : 5,
    marginBottom: 10,
  },
  iconButton: {
    padding: 12,
    paddingTop: Platform.OS === 'android' ? 25 : 45,
  },
  menuButton: {
    padding: 12,
    paddingTop: Platform.OS === 'android' ? 25 : 45,
  },
  loadingText: {
    ...theme.typography.body,
    color: '#ffffff',
    textAlign: 'center',
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
    ...theme.typography.body,
    color: '#ef4444',
    textAlign: 'center',
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
    ...theme.typography.body,
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomSheetContent: {
    flex: 1,
    paddingTop: 0,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  userDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    ...theme.typography.body,
    color: '#ffffff',
    marginRight: 8,
  },
  value: {
    ...theme.typography.body,
    color: '#60a5fa',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  comingSoon: {
    ...theme.typography.h2,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
  },
  comingSoonSubtitle: {
    ...theme.typography.body,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statPointsLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  statPointsValue: {
    fontFamily: 'PressStart2P',
    fontSize: 24,
    color: '#60a5fa',
  },
  usernameContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? -25 : -25,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  usernameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Platform.OS === 'android' ? 0 : -5,
  },
  username: {
    color: '#60a5fa',
    fontSize: Platform.OS === 'android' ? 22 : 18,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inventoryContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingLeft: 5,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsValue: {
    fontFamily: 'PressStart2P',
    fontSize: 20,
    color: '#60a5fa',
  },
});