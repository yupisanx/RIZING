import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Icons } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import MessageModal from '../components/MessageModal';
import { theme } from '../utils/theme';
import * as ImagePicker from 'expo-image-picker';
import RadarChart from '../components/common/RadarChart';

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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { toggleMenu, logout } = useMenu();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ABOUT');
  const [profileImage, setProfileImage] = useState(null);
  const isMounted = useRef(true);

  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

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
              console.log('User data from Firebase:', data); // Debug log
              setUserData(data);
            } else {
              console.log('No user document found'); // Debug log
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

  const handleImagePick = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        
        // Update user data in Firestore
        if (user?.uid) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              profileImage: result.assets[0].uri
            });
          } catch (error) {
            console.error('Error updating profile image:', error);
            Alert.alert('Error', 'Failed to update profile image. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
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

  return (
    <View style={styles.container}>
      {/* Header Icons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Menu')}
          accessibilityLabel="Open menu"
        >
          <Icons name="menu" size={34} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMessageModal(true)}
          accessibilityLabel="Open messages"
        >
          <Icons name="mail" size={34} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.mainContent}>
          {/* Main Card */}
          <View style={[
            styles.mainCard,
            activeTab === 'STATS' && styles.mainCardExpanded
          ]}>
            <View style={styles.contentContainer}>
              {/* Image and Title Section */}
              <View style={styles.headerSection}>
                <TouchableOpacity 
                  style={styles.imageContainer}
                  onPress={handleImagePick}
                >
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.imagePlaceholder}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Icons name="camera" size={40} color="#60a5fa" />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.profileName}>
                    {userData?.username || userData?.displayName || 'Loading...'}
                  </Text>
                </View>
              </View>

              {/* Info Section */}
              {activeTab === 'ABOUT' && (
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>AGE</Text>
                    <Text style={styles.infoValue}>14 days</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>FRIENDSHIP</Text>
                    <View style={styles.friendshipContainer}>
                      <Text style={styles.infoValue}>Pals</Text>
                      <View style={styles.heartIcon} />
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>HUMAN</Text>
                    <Text style={[styles.infoValue, styles.unknownText]}>Unknown</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>FRIEND CODE</Text>
                    <View style={styles.codeContainer}>
                      <View style={styles.dotsContainer}>
                        {[...Array(7)].map((_, i) => (
                          <View key={i} style={[styles.dot, styles.activeDot]} />
                        ))}
                        {[...Array(3)].map((_, i) => (
                          <View key={i + 7} style={[styles.dot]} />
                        ))}
                      </View>
                      <View style={styles.eyeIcon} />
                    </View>
                  </View>
                </View>
              )}
              
              {activeTab === 'STATS' && (
                <View style={styles.statsContainer}>
                  <ScrollView 
                    style={styles.statsScrollView}
                    contentContainerStyle={styles.statsScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                  >
                    <RadarChart 
                      data={{
                        labels: ['STRENGTH', 'VITALITY', 'AGILITY', 'INTELLIGENCE', 'SENSE'],
                        datasets: [{
                          data: [
                            userData?.stats?.strength || 0,
                            userData?.stats?.vitality || 0,
                            userData?.stats?.agility || 0,
                            userData?.stats?.intelligence || 0,
                            userData?.stats?.sense || 0
                          ],
                        }],
                      }}
                      size={280}
                      color="#87CEEB"
                    />
                    <View style={styles.radarBottomSpace} />
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Bottom Tabs */}
            <View style={styles.tabsWrapper}>
              <View style={styles.tabsContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'ABOUT' && styles.activeTabButton]}
                  onPress={() => setActiveTab('ABOUT')}
                >
                  <Text style={[styles.tabText, activeTab === 'ABOUT' && styles.activeTabText]}>ABOUT</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'STATS' && styles.activeTabButton]}
                  onPress={() => setActiveTab('STATS')}
                >
                  <Text style={[styles.tabText, activeTab === 'STATS' && styles.activeTabText]}>STATS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Streak Card */}
          <TouchableOpacity style={styles.streakCard}>
            <View style={styles.streakContent}>
              <View style={styles.streakIconContainer}>
                <Icons name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakCount}>{userData?.streak || '0'} day streak</Text>
                <Text style={styles.streakSubtext}>Longest: {userData?.longestStreak || '0'} days</Text>
              </View>
              <Icons name="chevron-right" size={24} color="#8B8B8B" />
            </View>
          </TouchableOpacity>
          
          {/* Extra space at bottom */}
          <View style={{ height: 160 }} />
        </View>
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
    paddingLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
  },
  mainCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    marginBottom: 15,
    height: 440,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: '#9CA3AF',
  },
  mainCardExpanded: {
    height: 520,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  headerSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  imageContainer: {
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 138,
    height: 149,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    fontFamily: 'Cinzel',
  },
  infoContainer: {
    marginTop: -10,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 8,
    color: '#E69138',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Cinzel',
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Cinzel',
  },
  unknownText: {
    color: '#999999',
  },
  friendshipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#999999',
    borderRadius: 10,
    marginLeft: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#999999',
    marginRight: 5,
  },
  activeDot: {
    backgroundColor: '#FFD700',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#999999',
    borderRadius: 12,
  },
  tabsWrapper: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 25,
    padding: 4,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#87CEEB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#8B8B8B',
    fontFamily: 'Cinzel',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
  },
  streakCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 0.3,
    borderColor: '#9CA3AF',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakCount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
  },
  streakSubtext: {
    fontSize: 12,
    color: '#8B8B8B',
    fontFamily: 'Cinzel',
  },
  loadingText: {
    ...theme.typography.body,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#ef4444',
  },
  retryButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  retryButtonText: {
    ...theme.typography.body,
    color: '#ffffff',
    fontSize: 16,
  },
  statsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    marginBottom: 10,
    height: Platform.OS === 'android' ? 400 : 320,
  },
  statsScrollView: {
    width: '100%',
    flex: 1,
  },
  statsScrollContent: {
    alignItems: 'center',
    paddingBottom: 80,
    minHeight: Platform.OS === 'android' ? 400 : 320,
  },
  radarBottomSpace: {
    height: 80,
  },
});