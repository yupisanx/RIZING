import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, updateDoc, Timestamp, increment, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import buildQuestFilename from '../quest_filename_builder';
import questMap from '../assets/quests/questMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { QuestStateManager, QuestStates } from '../utils/questStateManager';

const COUNTDOWN_END_KEY = '@quest_countdown_end';

/**
 * Custom hook for managing quest-related operations
 * @param {string} userId - The current user's ID
 * @returns {Object} Quest-related state and functions
 */
export function useQuest(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayQuest, setTodayQuest] = useState(null);
  const [countdownEnd, setCountdownEnd] = useState(null);
  const [questState, setQuestState] = useState(QuestStates.ACTIVE);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        if (!userId) return;

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }

        const userData = userDoc.data();
        const now = Timestamp.now().toMillis();
        const originalEnd = userData.countdownEnd?.toMillis() || now;
        const currentState = userData.questState || QuestStates.ACTIVE;

        // Handle expired quests with correct catch-up logic
        if (now > originalEnd) {
          let missed = 0;
          let newEnd = originalEnd;
          
          // Calculate exact number of missed periods
          while (newEnd <= now) {
            missed++;
            newEnd += 24 * 60 * 60 * 1000;
          }

          if (missed > 0) {
            // Use transaction to safely update state and generate new quest
            await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists()) {
                throw new Error('User document does not exist');
              }

              const userData = userDoc.data();
              
              // Calculate new quest index
              const questFilename = buildQuestFilename(
                userData.gender || 'Male',
                userData.class || 'Tanker',
                userData.environment || 'Gym',
                userData.trainingDays || 5
              );
              
              if (!questMap[questFilename]) {
                throw new Error(`Quest not found: ${questFilename}`);
              }

              const quest = questMap[questFilename];
              const dayKeys = Object.keys(quest.plan);
              const newQuestIndex = (userData.currentQuestIndex + missed) % dayKeys.length;
              const dayData = quest.plan[dayKeys[newQuestIndex]];
              const questData = formatQuestData(dayData);

              if (!questData) {
                throw new Error('Failed to format quest data');
              }

              // Apply penalties if quest was active
              let stats = userData.stats || {};
              if (currentState === QuestStates.ACTIVE) {
                // Apply penalties for each missed day
                for (let i = 0; i < missed; i++) {
                  stats = await QuestStateManager.calculatePenalties(1, stats);
                }
              }

              // Update all state in one transaction
              transaction.update(userRef, {
                questState: QuestStates.ACTIVE,
                countdownEnd: Timestamp.fromMillis(newEnd),
                currentQuestIndex: newQuestIndex,
                stats: stats,
                streak: currentState === QuestStates.ACTIVE ? 0 : userData.streak,
                lastQuestGeneratedAt: Timestamp.now(),
                activeQuest: questData
              });

              // Update local state
              setQuestState(QuestStates.ACTIVE);
              setCountdownEnd(Timestamp.fromMillis(newEnd));
              setTodayQuest(questData);
            });

            // Show penalty alert
            Alert.alert(
              "Quest Expired",
              `You missed ${missed} day${missed > 1 ? 's' : ''} of quests.\nPenalties have been applied.\nYour next quest is ready!`,
              [{ text: "OK" }]
            );
          }
        } else {
          // No expiration, just set the states
          setQuestState(currentState);
          setCountdownEnd(userData.countdownEnd);
          setTodayQuest(userData.activeQuest);
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, [userId]);

  // Helper function to format quest data consistently
  const formatQuestData = (dayData) => {
    if (!dayData || !dayData.exercises) {
      console.error('Invalid day data:', dayData);
      return null;
    }
    
    console.log('Raw day data:', dayData);
    
    const formattedData = {
      exercises: dayData.exercises.map(exercise => {
        if (!exercise || typeof exercise !== 'object') {
          console.error('Invalid exercise data:', exercise);
          return null;
        }
        
        // Ensure name is a string and not empty
        const exerciseName = String(exercise.name || '').trim();
        if (!exerciseName) {
          console.error('Empty exercise name:', exercise);
          return null;
        }

        return {
          name: exerciseName,
          sets: Number(exercise.sets) || 3,
          reps: Number(exercise.reps) || 15,
          total: Number(exercise.total) || 45,
          estimated_time_seconds: Number(exercise.estimated_time_seconds) || 120
        };
      }).filter(exercise => exercise !== null), // Remove any null exercises
      focus: String(dayData.focus || "General").trim(),
      total_reps_all_exercises: Number(dayData.total_reps_all_exercises) || 225
    };

    // Validate the formatted data
    if (!formattedData.exercises.length) {
      console.error('No valid exercises found in formatted data');
      return null;
    }

    console.log('Formatted quest data:', formattedData);
    return formattedData;
  };

  /**
   * Loads the current quest data for the user
   * @param {boolean} forceReload - Whether to force reload the quest data
   */
  const loadTodayQuest = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User ID is required');
      }

      const userRef = doc(db, 'users', userId);
      
      // Use transaction to safely read and update quest state
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User document does not exist');
        }

      const userData = userDoc.data();
        const serverTime = Timestamp.now().toMillis();
        const currentState = userData.questState || QuestStates.ACTIVE;
        const countdownEndTime = userData.countdownEnd?.toMillis() || 0;

        // If we're in cooldown and countdown hasn't ended, maintain state
        if (currentState === QuestStates.COOLDOWN && serverTime < countdownEndTime) {
          setQuestState(QuestStates.COOLDOWN);
          setCountdownEnd(userData.countdownEnd);
          return;
        }

        // If we need a new quest
        if (forceReload || !userData.activeQuest || currentState === QuestStates.COOLDOWN) {
      const questFilename = buildQuestFilename(
          userData.gender || 'Male',
          userData.class || 'Tanker',
          userData.environment || 'Gym',
          userData.trainingDays || 5
      );

      if (!questMap[questFilename]) {
        throw new Error(`Quest not found: ${questFilename}`);
      }

      const quest = questMap[questFilename];
      const dayKeys = Object.keys(quest.plan);
          const currentIndex = userData.currentQuestIndex || 0;
          const newQuestIndex = currentIndex + 1;
          const dayData = quest.plan[dayKeys[newQuestIndex % dayKeys.length]];
      const questData = formatQuestData(dayData);
      
      if (!questData) {
        throw new Error('Failed to format quest data');
      }

          // Calculate new countdown end based on current countdown end
          const newCountdownEnd = Timestamp.fromMillis(countdownEndTime + (24 * 60 * 60 * 1000));

          transaction.update(userRef, {
        activeQuest: questData,
        countdownEnd: newCountdownEnd,
          questState: QuestStates.ACTIVE,
        lastQuestUpdate: Timestamp.now(),
        currentQuestIndex: newQuestIndex
          });

        setQuestState(QuestStates.ACTIVE);
      setTodayQuest(questData);
      setCountdownEnd(newCountdownEnd);
        } else {
          setTodayQuest(userData.activeQuest);
          setCountdownEnd(userData.countdownEnd);
          setQuestState(currentState);
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading quest:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [userId]);

  // Add background update check
  useEffect(() => {
    const checkForUpdates = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const serverTime = Date.now();
        const lastUpdate = userData.lastQuestUpdate?.toMillis() || 0;
        
        // Check if we need to update quest (every 5 minutes)
        if (serverTime - lastUpdate > 5 * 60 * 1000) {
          await loadTodayQuest(true);
        }
      } catch (error) {
        console.error('Error in background update check:', error);
      }
    };

    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, loadTodayQuest]);

  /**
   * Handles quest completion
   */
  const handleQuestComplete = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await QuestStateManager.handleQuestCompletion(userId, db);
      if (result.success) {
        setQuestState(QuestStates.COOLDOWN);
        setCountdownEnd(result.countdownEnd);
      }
      return result;
    } catch (error) {
      console.error('Error completing quest:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, [userId, db]);

  /**
   * Handles quest failure
   */
  const handleQuestFailure = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await QuestStateManager.handleQuestExpiration(userId, db);
      if (result.success) {
        setQuestState(QuestStates.COOLDOWN);
        setCountdownEnd(result.countdownEnd);
      }
      return result;
    } catch (error) {
      console.error('Error handling quest failure:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, [userId, db]);

  /**
   * Handles expired quest
   */
  const handleExpiredQuest = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await QuestStateManager.handleQuestExpiration(userId, db);
      if (result.success) {
        setQuestState(QuestStates.ACTIVE);
        setCountdownEnd(result.countdownEnd);
        await loadTodayQuest();
      }
      return result;
    } catch (error) {
      console.error('Error handling expired quest:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, [userId, db, loadTodayQuest]);

  return {
    loading,
    error,
    todayQuest,
    countdownEnd,
    questState,
    loadTodayQuest,
    handleQuestComplete,
    handleQuestFailure,
    handleExpiredQuest
  };
} 