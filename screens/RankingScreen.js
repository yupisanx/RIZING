import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/Icons';
import MessageModal from '../components/MessageModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import buildQuestFilename from '../quest_filename_builder';
import questMap from '../assets/quests/questMap';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 90;
const STATUS_BAR_HEIGHT = Platform.select({
  ios: 0,
  android: 24,
});

export default function RankingScreen() {
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  const loadPlayerData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const playerData = userDoc.data();
        
        // Example return type structure
        const exampleData = {
          gender: playerData.gender || 'not set',
          class: playerData.class || 'not set',
          environment: playerData.environment || 'not set',
          frequency: playerData.trainingDays || 0,
          currentQuestIndex: playerData.currentQuestIndex || 0
        };

        // Show example output in console
        console.log('Example Return Type:');
        console.log(JSON.stringify(exampleData, null, 2));
        
        return exampleData;
      } else {
        console.error('No player data found');
        return null;
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      return null;
    }
  };

  const handleTestButtonPress = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'No user ID found');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const playerData = userDoc.data();
        const questFilename = buildQuestFilename(
          playerData.gender || 'Male',
          playerData.class || 'Tanker',
          playerData.environment || 'Gym',
          playerData.trainingDays || 5
        );
        
        // Load quest data using questMap
        const questData = questMap[questFilename];
        if (!questData) {
          console.error('Quest not found:', questFilename);
          Alert.alert('Error', 'Quest data not found');
          return;
        }
        
        // Get today's quest based on currentQuestIndex
        const currentQuestIndex = playerData.currentQuestIndex || 0;
        const dayKeys = Object.keys(questData.plan);
        const todayQuest = questData.plan[dayKeys[currentQuestIndex]];
        
        if (!todayQuest) {
          console.error('Today\'s quest not found. Index:', currentQuestIndex);
          Alert.alert('Error', 'Could not load today\'s quest');
          return;
        }
        
        // Log quest data for testing
        console.log('Today\'s Quest:', todayQuest);
        Alert.alert('Success', `Loaded quest for ${dayKeys[currentQuestIndex]}\nFocus: ${todayQuest.focus}`);
      } else {
        Alert.alert('Error', 'No user data found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data: ' + error.message);
    }
  };

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
            <Icons name="user" size={24} color="#60a5fa" />
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
            <Icons name="log-out" size={20} color="#60a5fa" />
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
          <View style={styles.content}>
            <Text style={styles.text}>Ranking Screen</Text>
            
            {/* Test Button */}
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestButtonPress}
            >
              <Text style={styles.testButtonText}>Test Load Player Data</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
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
    width: width * 0.75,
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
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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
  extraSpace: {
    width: '100%',
  },
  testButton: {
    backgroundColor: '#60a5fa',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
}); 