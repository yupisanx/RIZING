import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuestComponent from '../components/QuestComponent';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, Timestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import buildQuestFilename from '../quest_filename_builder';
import questMap from '../assets/quests/questMap';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SCREEN_PADDING = 20;
const HEADER_HEIGHT = 90;
const STATUS_BAR_HEIGHT = Platform.select({
  ios: 0,
  android: 24,
});

export default function QuestScreen() {
  const insets = useSafeAreaInsets();
  const [questModalVisible, setQuestModalVisible] = useState(true);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayQuest, setTodayQuest] = useState(null);
  const [error, setError] = useState(null);
  const [countdownEnd, setCountdownEnd] = useState(null);
  const [questState, setQuestState] = useState('active');

  const loadTodayQuest = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('No user data found');
      }

      const playerData = userDoc.data();
      
      // If not forcing reload and in cooldown, just update countdown
      if (!forceReload && playerData.questState === 'cooldown') {
        setQuestState('cooldown');
        setCountdownEnd(playerData.countdownEnd);
        setLoading(false);
        return;
      }

      const questFilename = buildQuestFilename(
        playerData.gender || 'Male',
        playerData.class || 'Tanker',
        playerData.environment || 'Gym',
        playerData.trainingDays || 5
      );

      const questData = questMap[questFilename];
      if (!questData) {
        throw new Error(`Quest not found: ${questFilename}`);
      }

      if (!questData.plan || typeof questData.plan !== 'object') {
        throw new Error('Invalid quest plan structure');
      }

      const dayKeys = Object.keys(questData.plan);
      if (dayKeys.length === 0) {
        throw new Error('No days available in quest plan');
      }

      // Get the current day index (0-based)
      const currentDayIndex = Math.floor((Date.now() - playerData.lastQuestGeneratedAt?.toDate().getTime() || Date.now()) / (24 * 60 * 60 * 1000));
      const safeQuestIndex = currentDayIndex % dayKeys.length;

      // Only increment index if we're forcing a reload and not in cooldown
      let nextQuestIndex = playerData.currentQuestIndex || 0;
      if (forceReload && playerData.questState !== 'cooldown') {
        nextQuestIndex = (nextQuestIndex + 1) % dayKeys.length;
      }

      const todayQuestData = questData.plan[dayKeys[nextQuestIndex]];
      if (!todayQuestData) {
        throw new Error(`No quest data for day ${dayKeys[nextQuestIndex]}`);
      }

      // Only update state if quest data has changed
      if (JSON.stringify(todayQuest) !== JSON.stringify(todayQuestData)) {
        setTodayQuest(todayQuestData);
      }

      const countdownEndTimestamp = playerData.countdownEnd || Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setCountdownEnd(countdownEndTimestamp);

      // Only update Firestore if necessary
      if (nextQuestIndex !== playerData.currentQuestIndex || 
          playerData.questState !== 'active' ||
          forceReload) {
        await updateDoc(doc(db, 'users', user.uid), {
          activeQuest: todayQuestData,
          countdownEnd: countdownEndTimestamp,
          lastQuestGeneratedAt: Timestamp.now(),
          questState: 'active',
          currentQuestIndex: nextQuestIndex
        });
      }
    } catch (error) {
      console.error('Error loading quest:', error);
      setError(error.message);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          currentQuestIndex: 0,
          questState: 'active',
          lastQuestGeneratedAt: Timestamp.now()
        });
      } catch (resetError) {
        console.error('Error resetting quest index:', resetError);
      }
    } finally {
      setLoading(false);
    }
  }, [user, todayQuest]);

  useEffect(() => {
    if (user?.uid) {
      loadTodayQuest();
    }
  }, [user, loadTodayQuest]);

  const handleQuestComplete = async () => {
    try {
      const countdownEndTimestamp = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      await updateDoc(doc(db, 'users', user.uid), {
        questState: 'cooldown',
        countdownEnd: countdownEndTimestamp,
        xp: increment(100),
        coins: increment(100),
        streak: increment(1)
      });
      setQuestState('cooldown');
      setCountdownEnd(countdownEndTimestamp);
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const handleQuestFailure = async () => {
    try {
      // First get the current user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const playerData = userDoc.data();
      
      // Get next quest data
      const questFilename = buildQuestFilename(
        playerData.gender || 'Male',
        playerData.class || 'Tanker',
        playerData.environment || 'Gym',
        playerData.trainingDays || 5
      );
      
      const dayKeys = Object.keys(questMap[questFilename].plan);
      const nextDayIndex = (playerData.currentQuestIndex + 1) % dayKeys.length;
      const nextQuestData = questMap[questFilename].plan[dayKeys[nextDayIndex]];

      // Set up new countdown
      const countdownEndTimestamp = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

      // Get current stats from the stats map
      const currentStats = playerData.stats || {
        strength: 0,
        vitality: 0,
        agility: 0,
        intelligence: 0,
        sense: 0
      };

      // Prepare the update object
      const updateData = {
        // Reset streak to 0
        streak: 0,
        // Update quest state
        questState: 'active',
        currentQuestIndex: nextDayIndex,
        activeQuest: nextQuestData,
        countdownEnd: countdownEndTimestamp,
        lastQuestGeneratedAt: Timestamp.now(),
        // Update stats map with decremented values
        stats: {
          ...currentStats,
          strength: Math.max(0, currentStats.strength - 1),
          vitality: Math.max(0, currentStats.vitality - 1),
          agility: Math.max(0, currentStats.agility - 1),
          intelligence: Math.max(0, currentStats.intelligence - 1),
          sense: Math.max(0, currentStats.sense - 1)
        }
      };

      // Remove any duplicate stats from root level
      const statsToRemove = {
        strength: null,
        vitality: null,
        agility: null,
        intelligence: null,
        sense: null
      };

      // Update Firestore with all changes
      await updateDoc(doc(db, 'users', user.uid), {
        ...updateData,
        ...statsToRemove
      });

      // Update local state
      setCountdownEnd(countdownEndTimestamp);
      setQuestState('active');
      setTodayQuest(nextQuestData);

      // Show penalty message with details only if we haven't shown it recently
      const lastPenaltyAlert = await AsyncStorage.getItem('@last_penalty_alert');
      const now = Date.now();
      
      if (!lastPenaltyAlert || (now - parseInt(lastPenaltyAlert)) > 5000) { // 5 second cooldown
        await AsyncStorage.setItem('@last_penalty_alert', now.toString());
        Alert.alert(
          "Quest Failed",
          "You have failed to complete your quest in time.\n\nPenalties applied:\n" +
          "- All stats reduced by 1\n" +
          "- Streak reset to 0",
          [{ text: "OK" }]
        );
      }

    } catch (error) {
      console.error('Error handling quest failure:', error);
      Alert.alert(
        "Error",
        "Failed to process quest failure. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleCooldownEnd = async () => {
    try {
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const playerData = userDoc.data();

      // Calculate next quest index
      const questFilename = buildQuestFilename(
        playerData.gender || 'Male',
        playerData.class || 'Tanker',
        playerData.environment || 'Gym',
        playerData.trainingDays || 5
      );
      
      const dayKeys = Object.keys(questMap[questFilename].plan);
      const nextDayIndex = (playerData.currentQuestIndex + 1) % dayKeys.length;
      const nextQuestData = questMap[questFilename].plan[dayKeys[nextDayIndex]];

      // Set up new countdown
      const countdownEndTimestamp = Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        questState: 'active',
        currentQuestIndex: nextDayIndex,
        activeQuest: nextQuestData,
        countdownEnd: countdownEndTimestamp,
        lastQuestGeneratedAt: Timestamp.now()
      });

      // Update local state
      setQuestState('active');
      setCountdownEnd(countdownEndTimestamp);
      setTodayQuest(nextQuestData);

    } catch (error) {
      console.error('Error handling cooldown end:', error);
      Alert.alert(
        "Error",
        "Failed to process cooldown end. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill]}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.modalWrapper}>
            <QuestComponent 
              isVisible={questModalVisible}
              questData={todayQuest}
              loading={loading}
              error={error}
              countdownEnd={countdownEnd}
              questState={questState}
              onQuestComplete={handleQuestComplete}
              onQuestFailure={handleQuestFailure}
              onCooldownEnd={handleCooldownEnd}
            />
          </View>
          <View style={styles.extraSpace} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    minHeight: height * 1.2,
  },
  modalWrapper: {
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: height * 0.1 + 250,
  },
  extraSpace: {
    height: height * 0.2,
  }
}); 