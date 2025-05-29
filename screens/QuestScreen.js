import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuestComponent from '../components/QuestComponent';
import { useAuth } from '../contexts/AuthContext';
import { useQuest } from '../hooks/useQuest';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SCREEN_PADDING = 20;
const HEADER_HEIGHT = 90;
const STATUS_BAR_HEIGHT = Platform.select({
  ios: 0,
  android: 24,
});

/**
 * QuestScreen component that displays the current quest and handles quest-related operations
 * @returns {JSX.Element} The quest screen component
 */
export default function QuestScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    loading,
    error,
    todayQuest,
    countdownEnd,
    questState,
    loadTodayQuest,
    handleQuestComplete,
    handleQuestFailure,
    handleExpiredQuest
  } = useQuest(user?.uid);

  useEffect(() => {
    const loadQuest = async () => {
      if (user?.uid) {
        await loadTodayQuest();
      }
    };

    loadQuest();
  }, [user, loadTodayQuest]);

  const handleCompletePress = async () => {
    const result = await handleQuestComplete();
    if (result.success) {
      Alert.alert(
        "Quest Completed!",
        `You have successfully completed your quest!\n\nRewards:\n- +100 XP\n- +100 Coins\n- +3 Stat Points\n\nNext quest unlocks in ${result.remainingHours} hours.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Error",
        "Failed to complete quest. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleFailurePress = async () => {
    const result = await handleQuestFailure();
    if (result.success) {
      const lastPenaltyAlert = await AsyncStorage.getItem('@last_penalty_alert');
      const now = Date.now();
      
      if (!lastPenaltyAlert || (now - parseInt(lastPenaltyAlert)) > 5000) {
        await AsyncStorage.setItem('@last_penalty_alert', now.toString());
        Alert.alert(
          "Quest Failed",
          "You have failed to complete your quest in time.\n\nPenalties applied:\n" +
          "- All stats reduced by 1\n" +
          "- Streak reset to 0",
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Error",
        "Failed to process quest failure. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.headerGradient}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quest data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : questState === 'cooldown' ? (
        <View style={styles.cooldownWrapper}>
          <QuestComponent
            isVisible={true}
            questData={todayQuest}
            loading={loading}
            error={error}
            countdownEnd={countdownEnd}
            questState={questState}
            onQuestComplete={handleCompletePress}
            onQuestFailure={handleFailurePress}
            onCooldownEnd={handleExpiredQuest}
            route={route}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <QuestComponent
            isVisible={true}
            questData={todayQuest}
            loading={loading}
            error={error}
            countdownEnd={countdownEnd}
            questState={questState}
            onQuestComplete={handleCompletePress}
            onQuestFailure={handleFailurePress}
            onCooldownEnd={handleExpiredQuest}
            route={route}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
    zIndex: 1,
  },
  cooldownWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
    paddingBottom: SCREEN_PADDING,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Cinzel',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Cinzel',
  },
}); 