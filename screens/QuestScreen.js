import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuestComponent from '../components/QuestComponent';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import buildQuestFilename from '../quest_filename_builder';
import questMap from '../assets/quests/questMap';

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

  useEffect(() => {
    if (user?.uid) {
      loadTodayQuest();
    }
  }, [user]);

  const loadTodayQuest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('No user data found');
      }

      const playerData = userDoc.data();
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

      const currentQuestIndex = playerData.currentQuestIndex || 0;
      const dayKeys = Object.keys(questData.plan);
      const todayQuestData = questData.plan[dayKeys[currentQuestIndex]];

      if (!todayQuestData) {
        throw new Error('Could not load today\'s quest');
      }

      setTodayQuest(todayQuestData);

      // Update Firestore document with the selected quest and timestamps
      const countdownEndTimestamp = playerData.countdownEnd || Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setCountdownEnd(countdownEndTimestamp);

      await updateDoc(doc(db, 'users', user.uid), {
        activeQuest: todayQuestData,
        countdownEnd: countdownEndTimestamp,
        lastQuestGeneratedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error loading quest:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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