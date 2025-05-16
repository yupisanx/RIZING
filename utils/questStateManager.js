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

const STATE_TRANSITIONS = {
  [QuestStates.ACTIVE]: [QuestStates.COMPLETED, QuestStates.EXPIRED],
  [QuestStates.COMPLETED]: [QuestStates.COOLDOWN],
  [QuestStates.COOLDOWN]: [QuestStates.ACTIVE],
  [QuestStates.EXPIRED]: [QuestStates.COOLDOWN]
};

export class QuestStateManager {
  static async getCurrentState() {
    try {
      const state = await AsyncStorage.getItem('@quest_state');
      const countdownEnd = await AsyncStorage.getItem('@quest_countdown_end');
      return {
        state: state || QuestStates.ACTIVE,
        countdownEnd: countdownEnd ? Timestamp.fromMillis(parseInt(countdownEnd)) : null
      };
    } catch (error) {
      console.error('Error getting quest state:', error);
      return { state: QuestStates.ACTIVE, countdownEnd: null };
    }
  }

  static async persistState(state, countdownEnd = null) {
    try {
      await AsyncStorage.setItem('@quest_state', state);
      if (countdownEnd) {
        await AsyncStorage.setItem('@quest_countdown_end', countdownEnd.toMillis().toString());
      }
    } catch (error) {
      console.error('Error persisting quest state:', error);
    }
  }

  static async validateStateTransition(currentState, newState) {
    const allowedTransitions = STATE_TRANSITIONS[currentState] || [];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(`Invalid state transition from ${currentState} to ${newState}`);
    }
    return true;
  }

  static async calculateCooldownEnd(currentTime, timezoneOffset = 0) {
    try {
      // Get next reset time (midnight)
      const now = new Date(currentTime);
      const nextReset = new Date(now);
      nextReset.setHours(24, 0, 0, 0); // Set to next midnight
      
      // Calculate cooldown duration (time until next reset)
      const cooldownDuration = nextReset.getTime() - currentTime;
      
      // Return timestamp for next reset
      return Timestamp.fromMillis(nextReset.getTime());
    } catch (error) {
      console.error('Error calculating cooldown end:', error);
      // Fallback to 24 hours from now
      return Timestamp.fromMillis(currentTime + (24 * 60 * 60 * 1000));
    }
  }

  static async getRemainingCooldownTime(currentTime, countdownEnd) {
    if (!countdownEnd) return 0;
    
    try {
      const endTime = countdownEnd.toMillis();
      const remainingTime = endTime - currentTime;
      return Math.max(0, remainingTime);
    } catch (error) {
      console.error('Error getting remaining cooldown time:', error);
      return 0;
    }
  }

  static async handleQuestCompletion(userId, db) {
    try {
      const now = Timestamp.now();
      const { state: currentState } = await this.getCurrentState();
      
      // Validate state transition
      await this.validateStateTransition(currentState, QuestStates.COMPLETED);
      
      // Calculate new cooldown end (time until next reset)
      const newCountdownEnd = await this.calculateCooldownEnd(now.toMillis());
      
      // Update state
      await this.persistState(QuestStates.COOLDOWN, newCountdownEnd);
      
      // Calculate remaining hours until next reset
      const remainingHours = Math.ceil((newCountdownEnd.toMillis() - now.toMillis()) / (60 * 60 * 1000));
      
      return {
        success: true,
        countdownEnd: newCountdownEnd,
        remainingHours: remainingHours
      };
    } catch (error) {
      console.error('Error handling quest completion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async handleQuestExpiration(userId, db) {
    try {
      const now = Timestamp.now();
      const { state: currentState } = await this.getCurrentState();
      
      // Validate state transition
      await this.validateStateTransition(currentState, QuestStates.EXPIRED);
      
      // Calculate new cooldown end
      const newCountdownEnd = await this.calculateCooldownEnd(now.toMillis());
      
      // Update state
      await this.persistState(QuestStates.COOLDOWN, newCountdownEnd);
      
      return {
        success: true,
        countdownEnd: newCountdownEnd
      };
    } catch (error) {
      console.error('Error handling quest expiration:', error);
      return {
        success: false,
        error: error.message
      };
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