import { Timestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEST_STATE_KEY = '@quest_state';
const LAST_STATE_CHANGE_KEY = '@last_state_change';

export const QuestStates = {
  ACTIVE: 'active',
  COOLDOWN: 'cooldown',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

export const StateTransitions = {
  [QuestStates.ACTIVE]: [QuestStates.COMPLETED, QuestStates.FAILED, QuestStates.EXPIRED, QuestStates.COOLDOWN],
  [QuestStates.COOLDOWN]: [QuestStates.ACTIVE, QuestStates.EXPIRED],
  [QuestStates.COMPLETED]: [QuestStates.COOLDOWN, QuestStates.ACTIVE],
  [QuestStates.FAILED]: [QuestStates.ACTIVE],
  [QuestStates.EXPIRED]: [QuestStates.ACTIVE]
};

export class QuestStateManager {
  static async validateStateTransition(currentState, newState) {
    // Allow same-state transitions
    if (currentState === newState) {
      return true;
    }

    // Validate state transition if states are different
    if (!StateTransitions[currentState]?.includes(newState)) {
      throw new Error(`Invalid state transition from ${currentState} to ${newState}`);
    }
    return true;
  }

  static async persistState(state, timestamp = Date.now()) {
    try {
      await AsyncStorage.multiSet([
        [QUEST_STATE_KEY, state],
        [LAST_STATE_CHANGE_KEY, timestamp.toString()]
      ]);
    } catch (error) {
      console.error('Error persisting quest state:', error);
      throw new Error('Failed to persist quest state');
    }
  }

  static async getCurrentState() {
    try {
      const [state, lastChange] = await AsyncStorage.multiGet([
        QUEST_STATE_KEY,
        LAST_STATE_CHANGE_KEY
      ]);
      return {
        state: state[1] || QuestStates.ACTIVE,
        lastChange: parseInt(lastChange[1] || '0')
      };
    } catch (error) {
      console.error('Error retrieving quest state:', error);
      return { state: QuestStates.ACTIVE, lastChange: 0 };
    }
  }

  static async calculateRewards(streak, difficulty) {
    const baseXP = 100;
    const baseCoins = 100;
    const baseStatPoints = 3;

    // Streak bonus (capped at 5x)
    const streakMultiplier = Math.min(1 + (streak * 0.1), 5);
    
    // Difficulty multiplier (1.0 to 2.0)
    const difficultyMultiplier = 1 + (difficulty * 0.2);

    return {
      xp: Math.floor(baseXP * streakMultiplier * difficultyMultiplier),
      coins: Math.floor(baseCoins * streakMultiplier * difficultyMultiplier),
      statPoints: Math.floor(baseStatPoints * streakMultiplier * difficultyMultiplier)
    };
  }

  static async calculatePenalties(missedDays, currentStats) {
    // Graduated penalties based on missed days
    const penaltyMultiplier = Math.min(1 + (missedDays * 0.2), 3);
    
    return {
      strength: Math.max(0, currentStats.strength - Math.floor(1 * penaltyMultiplier)),
      vitality: Math.max(0, currentStats.vitality - Math.floor(1 * penaltyMultiplier)),
      agility: Math.max(0, currentStats.agility - Math.floor(1 * penaltyMultiplier)),
      intelligence: Math.max(0, currentStats.intelligence - Math.floor(1 * penaltyMultiplier)),
      sense: Math.max(0, currentStats.sense - Math.floor(1 * penaltyMultiplier))
    };
  }

  static async calculateCooldownEnd(currentTime, timezoneOffset = 0, lastCountdownEnd = null) {
    // If we have a previous countdown end, calculate remaining time
    if (lastCountdownEnd) {
      const remainingTime = lastCountdownEnd - currentTime;
      if (remainingTime > 0) {
        return Timestamp.fromMillis(lastCountdownEnd);
      }
    }

    // Otherwise, start a new 24-hour cooldown
    const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours
    return Timestamp.fromMillis(currentTime + cooldownDuration + timezoneOffset);
  }

  static async getRemainingCooldownTime(currentTime, countdownEnd) {
    if (!countdownEnd) return 0;
    
    const endTime = countdownEnd.toMillis();
    const remainingTime = endTime - currentTime;
    return Math.max(0, remainingTime);
  }

  static async validateQuestData(questData) {
    if (!questData) {
      throw new Error('Quest data is required');
    }

    if (!questData.exercises || !Array.isArray(questData.exercises)) {
      throw new Error('Invalid quest exercises data');
    }

    if (!questData.difficulty || typeof questData.difficulty !== 'number') {
      throw new Error('Invalid quest difficulty');
    }

    return true;
  }
} 