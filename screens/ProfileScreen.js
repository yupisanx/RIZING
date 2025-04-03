import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { doc, getDoc } from 'firebase/firestore';
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
  const { toggleMenu } = useMenu();

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

  // Initialize animation value and show bottom sheet
  useEffect(() => {
    setIsBottomSheetVisible(true);
    
    return () => {
      isMounted.current = false;
      setIsBottomSheetVisible(false);
    };
  }, []);

  // Handle navigation focus changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsBottomSheetVisible(true);
    });

    const blurUnsubscribe = navigation.addListener('blur', () => {
      setIsBottomSheetVisible(false);
    });

    return () => {
      unsubscribe();
      blurUnsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setError(null);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!isSubscribed) return;

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
        } else {
          setError('User data not found');
        }
      } catch (error) {
        if (!isSubscribed) return;
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isSubscribed = false;
    };
  }, [user?.uid]);

  const handleBottomSheetClose = () => {
    setIsBottomSheetVisible(false);
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
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>TIER BENEFITS</Text>
          <View style={styles.progressContainer}>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>75XP</Text>
              <Text style={styles.xpText}>1175XP TO TIER 2</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
            <View style={styles.tierContainer}>
              <Text style={styles.tierText}>TIER 1</Text>
            </View>
          </View>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icons name="check" size={20} color="#d8b4fe" />
              <Text style={styles.benefitText}>15% Birthday reward</Text>
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
    backgroundColor: '#d8b4fe',
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
  bottomSheetTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  progressContainer: {
    marginBottom: 30,
    width: '100%',
  },
  xpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#333333',
    borderRadius: 1.5,
    marginBottom: 20,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d8b4fe',
    borderRadius: 1.5,
  },
  tierContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tierText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  benefitsList: {
    marginTop: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(216, 180, 254, 0.1)',
    borderRadius: 10,
  },
  benefitText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  }
});