import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Icons } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import MessageModal from '../components/MessageModal';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const navigation = useNavigation();

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const calculateLevelProgress = () => {
    const xpForNextLevel = (userData.level + 1) * 1000;
    const progress = (userData.xp / xpForNextLevel) * 100;
    return `${Math.min(progress, 100)}%`;
  };

  return (
    <View style={styles.container}>
      {/* Header Icons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMessageModal(true)}>
          <Icons name="mail" size={28} color="#d8b4fe" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleMenu}>
          <Icons name="menu" size={28} color="#d8b4fe" />
        </TouchableOpacity>
      </View>

      {/* Level Bar */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Lv. {userData.level}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: calculateLevelProgress() }]} />
        </View>
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
            transform: [{ translateX: slideAnim }]
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
            }}>
            <Icons name="log-out" size={20} color="#d8b4fe" />
            <Text style={styles.menuItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.mainContent}>
        {/* Avatar */}
        <Image
          source={userData.gender === 'male' 
            ? require('../assets/avatars/male-avatar.png')
            : require('../assets/avatars/female-avatar.png')
          }
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>

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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: -40,
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
  levelContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    paddingVertical: 2,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    width: '50%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d8b4fe',
    borderRadius: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: width * 1.0,
    height: width * 1.26,
    marginTop: -120,
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
  }
});