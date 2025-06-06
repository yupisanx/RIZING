import * as React from "react"
import { useState, useEffect, useCallback, memo } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Calendar } from 'react-native-calendars'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, increment, arrayUnion, onSnapshot } from 'firebase/firestore'
import { auth } from '../config/firebase'
import { useSelfCareAreas } from '../contexts/SelfCareAreaContext'
import { useGoals } from '../contexts/GoalsContext'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ThreeDButton from '../components/ThreeDButton';
import { useAuth } from '../contexts/AuthContext'
import { AntDesign } from '@expo/vector-icons';

// Define the AsyncStorage interface
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
}

// Use type assertion to cast AsyncStorage
const storage = AsyncStorage as unknown as AsyncStorageInterface

// Theme configuration
const theme = {
  colors: {
    primary: '#000000',
    secondary: '#000000',
    background: '#FFFFFF',
    text: {
      primary: '#374151',
      secondary: '#6B7280',
    },
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}

const { width, height } = Dimensions.get("window")

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in SelfCareAreaScreen:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Type definitions
export type SelfCareArea = {
  id: string
  name: string
  color: string
  emoji: string
  isCustom?: boolean
  userId?: string
}

type NavigationProp = NativeStackNavigationProp<any>

const selfCareAreas: SelfCareArea[] = [
  { id: "calm_1", name: "Calm", color: "#86EFAC", emoji: "🧘" },
  { id: "nutrition_2", name: "Nutrition", color: "#4ADE80", emoji: "🥗" },
  { id: "productivity_3", name: "Productivity", color: "#FDE68A", emoji: "✅" },
  { id: "movement_4", name: "Movement", color: "#FCD34D", emoji: "🏃" },
  { id: "sleep_5", name: "Sleep", color: "#A855F7", emoji: "😴" },
  { id: "gratitude_6", name: "Gratitude", color: "#F472B6", emoji: "🙏" },
  { id: "connection_7", name: "Connection", color: "#6366F1", emoji: "👥" },
]

// Memoized Components
const MainScreen = memo(({ 
  userAreas, 
  setSelectedArea, 
  setCurrentView, 
  setShowAreaSelection, 
  handleClose,
  username 
}: { 
  userAreas: SelfCareArea[]
  setSelectedArea: (area: SelfCareArea) => void
  setCurrentView: (view: "main" | "detail") => void
  setShowAreaSelection: (show: boolean) => void
  handleClose: () => void
  username: string
}) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#000000" />
    <View style={styles.headerSection}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>Nourish what matters to you</Text>
        <View style={styles.speechTail} />
      </View>
    </View>
    <View style={styles.contentSection}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === 'android' ? 24 : 32
        }}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>My Self-Care Areas</Text>
        </View>
        {userAreas.length > 0 && (
          <View style={styles.areasGrid}>
            {userAreas.map((area, index) => (
              <TouchableOpacity
                key={`${area.id}_${index}`}
                style={[
                  styles.areaCard,
                  { backgroundColor: '#000000' }
                ]}
                onPress={() => {
                  setSelectedArea(area);
                  setCurrentView('detail');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.areaCardContent}>
                  <Text style={styles.areaCardTitle}>{area.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.newAreaButton} onPress={() => setShowAreaSelection(true)} activeOpacity={0.7}>
          <Ionicons name="add" size={20} color="#9CA3AF" />
          <Text style={styles.newAreaButtonText}>Start a new area</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedbackCard} activeOpacity={0.8}>
          <View style={styles.feedbackContent}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <View style={styles.feedbackText}>
              <Text style={styles.feedbackLabel}>GOT FEEDBACK?</Text>
              <Text style={styles.feedbackTitle}>Tell us what you think!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  </SafeAreaView>
))

const DetailScreen = memo(({ 
  selectedArea, 
  setCurrentView, 
  setShowOptionsSheet,
  setShowCalendarModal,
  showCalendarModal 
}: { 
  selectedArea: SelfCareArea | null
  setCurrentView: (view: "main" | "detail") => void
  setShowOptionsSheet: (show: boolean) => void
  setShowCalendarModal: (show: boolean) => void
  showCalendarModal: boolean
}) => {
  const navigation = useNavigation<NavigationProp>()
  const { goals, isLoadingGoals, refreshGoals, setGoals } = useGoals();
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showExistingGoalsSheet, setShowExistingGoalsSheet] = useState(false);
  const { user } = useAuth();

  // Fetch goals from Firestore on mount
  useEffect(() => {
    const fetchGoalsFromFirestore = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return [];
      const userRef = doc(db, 'users', currentUser.uid);
      const goalsRef = collection(userRef, 'goals');
      const querySnapshot = await getDocs(goalsRef);
      const fetchedGoals = [];
      querySnapshot.forEach((doc) => {
        fetchedGoals.push({ id: doc.id, ...doc.data() });
      });
      return fetchedGoals;
    };
    refreshGoals(fetchGoalsFromFirestore).finally(() => {
      setIsInitialLoad(false);
    });
  }, [refreshGoals]);

  // Filter goals for this area
  const areaGoals = selectedArea ? goals.filter(goal => goal.areaId === selectedArea.id) : [];

  // Toggle completion with new structure
  const toggleGoalCompletion = async (id: string) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal || !user) return;

      const now = new Date();
      const completionData = {
        completedAt: now.toISOString(),
        notes: '',
        energy: 5,
      };

      const goalRef = doc(db, 'users', user.uid, 'goals', id);
      
      if (goal.status === 'active') {
        // Mark as completed
        await updateDoc(goalRef, {
          status: 'completed',
          lastCompletedAt: now.toISOString(),
          totalCompletions: increment(1),
          completions: arrayUnion(completionData),
          // Don't update startDate, keep the original
        });
      } else {
        // Mark as active again
        await updateDoc(goalRef, {
          status: 'active',
          lastCompletedAt: null,
          // Don't update startDate, keep the original
        });
      }

      // Update local state
      setGoals(goals => goals.map(g => 
        g.id === id 
          ? { 
              ...g, 
              status: g.status === 'active' ? 'completed' : 'active',
              lastCompletedAt: g.status === 'active' ? now.toISOString() : null,
              totalCompletions: g.status === 'active' ? (g.totalCompletions || 0) + 1 : g.totalCompletions,
              completions: g.status === 'active' 
                ? [...(g.completions || []), completionData]
                : g.completions,
              // Keep the original startDate
              startDate: g.startDate
            }
          : g
      ));
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      Alert.alert('Error', 'Failed to update goal completion status.');
    }
  };

  // Delete goal with new structure
  const deleteGoal = async (goalId: string) => {
    try {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
      setGoals(goals => goals.filter(goal => goal.id !== goalId));
      setEditGoalId(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal.');
    }
  };

  const handleAddNewGoal = () => {
    if (selectedArea) {
      navigation.navigate('Goal', { 
        areaId: selectedArea.id,
        areaName: selectedArea.name,
        areaColor: selectedArea.color
      })
    }
  }

  // Get goals for selected date
  const getGoalsForDate = (date: Date) => {
    // Create date objects with time set to midnight for accurate comparison
    const selectedDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    return goals.filter(goal => {
      // First filter by area
      if (selectedArea && goal.areaId !== selectedArea.id) {
        return false;
      }

      // Get goal's start date
      const goalDate = new Date(goal.startDate);
      // Adjust for timezone offset
      const localGoalDate = new Date(goalDate.getTime() + goalDate.getTimezoneOffset() * 60000);
      const goalDateStart = new Date(localGoalDate.getFullYear(), localGoalDate.getMonth(), localGoalDate.getDate());

      // For completed goals, check completions array FIRST
      // This ensures we can see completion history regardless of start date
      if (goal.completions && Array.isArray(goal.completions)) {
        const hasCompletion = goal.completions.some(completion => {
          const completionDate = new Date(completion.completedAt);
          // Adjust for timezone offset
          const localCompletionDate = new Date(completionDate.getTime() + completionDate.getTimezoneOffset() * 60000);
          return localCompletionDate >= selectedDateStart && localCompletionDate < selectedDateEnd;
        });
        if (hasCompletion) return true;
      }
      
      // For future dates, check if the selected date is before goal's start date
      if (selectedDateStart < goalDateStart) {
        return false;
      }
      
      // For repeating goals, check if the selected date matches the pattern
      if (goal.repeat) {
        const pattern = goal.repeat.pattern;
        const exclusions = goal.repeat.exclusions || [];
        const dateStr = selectedDateStart.toISOString().split('T')[0];
        
        // If date is excluded, don't show the goal
        if (exclusions.includes(dateStr)) return false;
        
        // Check if date matches the recurrence pattern
        switch (pattern.frequency) {
          case 'DAILY':
            return true;
          case 'WEEKLY':
            if (pattern.byDay) {
              const dayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][selectedDateStart.getDay()];
              return pattern.byDay.includes(dayStr);
            }
            return true;
          case 'MONTHLY':
            if (pattern.byMonthDay) {
              return pattern.byMonthDay.includes(selectedDateStart.getDate().toString());
            }
            return true;
          default:
            return false;
        }
      }
      
      // For non-repeating goals, only show on their start date
      return goalDateStart.getTime() === selectedDateStart.getTime();
    });
  };

  // Check if goal was completed on selected date
  const isGoalCompletedOnDate = (goal: any, date: Date) => {
    if (!goal.completions || !Array.isArray(goal.completions)) return false;
    
    // Create date objects with time set to midnight for accurate comparison
    const selectedDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    return goal.completions.some(completion => {
      const completionDate = new Date(completion.completedAt);
      // Adjust for timezone offset
      const localCompletionDate = new Date(completionDate.getTime() + completionDate.getTimezoneOffset() * 60000);
      return localCompletionDate >= selectedDateStart && localCompletionDate < selectedDateEnd;
    });
  };

  // Calculate unique days with at least one goal completion for this area
  const getActiveDaysCount = () => {
    const daysSet = new Set<string>();
    areaGoals.forEach(goal => {
      if (goal.completions && Array.isArray(goal.completions)) {
        goal.completions.forEach(completion => {
          const date = new Date(completion.completedAt);
          // Use only the date part (YYYY-MM-DD)
          const dateStr = date.toISOString().split('T')[0];
          daysSet.add(dateStr);
        });
      }
    });
    return daysSet.size;
  };

  // Calculate total number of completions for this area
  const getCompletedGoalsCount = () => {
    let total = 0;
    areaGoals.forEach(goal => {
      if (goal.completions && Array.isArray(goal.completions)) {
        total += goal.completions.length;
      }
    });
    return total;
  };

  return (
    <SafeAreaView style={styles.detailContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentView("main")} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOptionsSheet(true)} style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailTitleSection}>
        <View style={styles.detailIconContainer}>
          <View style={styles.detailIconCircle}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
        </View>
        <Text style={styles.detailTitle}>{selectedArea?.name}</Text>
      </View>
      <View style={styles.detailContentSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.weeklyView}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <View key={day + index} style={styles.dayContainer}>
                <View style={[styles.dayCircle, index === 5 && styles.activeDayCircle]}>
                  <Text style={[styles.dayText, index === 5 && styles.activeDayText]}>{day}</Text>
                </View>
                <View style={styles.dayProgress} />
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => setShowCalendarModal(true)} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.goalsSection}>
            <Text style={styles.goalsSectionTitle}>Your goals</Text>
            {isInitialLoad ? (
              <View style={styles.goalsList}>
                <View style={[styles.goalCard, styles.loadingCard]}>
                  <View style={styles.goalContent}>
                    <View style={styles.loadingPlaceholder} />
                    <View style={{ flex: 1 }}>
                      <View style={[styles.loadingPlaceholder, { width: '80%', height: 16 }]} />
                    </View>
                    <View style={styles.goalRight}>
                      <View style={[styles.loadingPlaceholder, { width: 40, height: 16 }]} />
                      <View style={[styles.loadingPlaceholder, { width: 42, height: 42, borderRadius: 21 }]} />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <>
                {areaGoals.length > 0 ? (
                  <View style={styles.goalsList}>
                    {areaGoals.map(goal => (
                      <View key={goal.id} style={styles.goalCard}>
                        <View style={styles.goalContent}>
                          <TouchableOpacity onPress={() => setEditGoalId(goal.id)} style={styles.threeDotButton}>
                            <MaterialIcons name="more-vert" size={24} color="#374151" />
                          </TouchableOpacity>
                          <View style={{ flex: 1 }}>
                            <Text style={[
                              styles.goalTitle,
                              goal.completed && { textDecorationLine: 'line-through', color: '#9CA3AF' }
                            ]}>{goal.text || goal.title}</Text>
                          </View>
                          <Text style={styles.ellipsis}>...</Text>
                        </View>
                        <Modal
                          visible={editGoalId === goal.id}
                          transparent
                          animationType="fade"
                          onRequestClose={() => setEditGoalId(null)}
                        >
                          <View style={styles.editModalOverlay}>
                            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' }} />
                            <View style={styles.editModalContent}>
                              <TouchableOpacity style={{ position: 'absolute', top: 26, left: 26, zIndex: 10 }} onPress={() => deleteGoal(goal.id)}>
                                <MaterialIcons name="delete" size={28} color="#F87171" />
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.editModalEditButton, { alignSelf: 'flex-end', marginRight: 0 }]}> 
                                <MaterialIcons name="edit" size={30} color="#FBBF24" />
                                <Text style={styles.editModalEditText}>Edit</Text>
                              </TouchableOpacity>
                              <View style={styles.editModalCard}>
                                <Text style={[styles.editModalGoalTitle, { textAlign: 'center' }]}>{goal.text || goal.title}</Text>
                              </View>
                              <View style={styles.editModalActionsRow}>
                                <TouchableOpacity style={[styles.editModalAction, {marginTop: 20}]}><MaterialCommunityIcons name="skip-forward" size={32} color="#a78bfa" /><Text style={styles.editModalActionText}>Skip</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.editModalAction}>
                                  <View style={styles.editModalActionIconBg}>
                                    <MaterialIcons name="check" size={42} color="#22C55E" />
                                  </View>
                                  <Text style={styles.editModalActionText}>Complete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.editModalAction, {marginTop: 20}]}><MaterialIcons name="calendar-today" size={32} color="#F87171" /><Text style={styles.editModalActionText}>Snooze</Text></TouchableOpacity>
                              </View>
                              <TouchableOpacity style={[styles.editModalClose, styles.editModalCloseCircle]} onPress={() => setEditGoalId(null)}>
                                <MaterialIcons name="close" size={22} color="#222" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Modal>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>You don't have any goals yet</Text>
                  </View>
                )}
                {/* Always show the add goal buttons */}
                <TouchableOpacity 
                  style={styles.addGoalButton} 
                  activeOpacity={0.8}
                  onPress={handleAddNewGoal}
                >
                  <View style={styles.addGoalContent}>
                    <View style={styles.plusIconContainer}>
                      <Ionicons name="add" size={16} color="white" />
                    </View>
                    <Text style={styles.addGoalButtonText}>Add a new goal</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.goalOptionsContainer}>
                  <TouchableOpacity 
                    style={styles.goalOptionButton} 
                    activeOpacity={0.7}
                    onPress={() => setShowExistingGoalsSheet(true)}
                  >
                    <View style={styles.goalOptionContent}>
                      <View style={styles.plusIconContainer}>
                        <Ionicons name="add" size={16} color="white" />
                      </View>
                      <Text style={styles.goalOptionText}>Add an existing goal</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {/* All-time Progress Card */}
                <View style={{
                  backgroundColor: '#FAFAFA',
                  borderRadius: 24,
                  padding: 31,
                  marginTop: -68,
                  marginBottom: 60,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 18.2,
                    fontWeight: '700',
                    color: '#6B7280',
                    marginBottom: 10,
                    fontFamily: 'Cinzel',
                  }}>All-time Progress</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 4 }}>
                    {/* Day active group */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                      <AntDesign name="checkcircle" size={28} color="#22C55E" style={{ marginRight: 8 }} />
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#222', fontFamily: 'Cinzel', marginTop: 6, marginBottom: 0, marginLeft: -40 }}> {getActiveDaysCount()} </Text>
                        <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600', fontFamily: 'Cinzel', marginTop: 0 }}>day active</Text>
                      </View>
                    </View>
                    {/* Goal done group */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="clipboard" size={22} color="#22C55E" style={{ marginRight: 8 }} />
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#222', fontFamily: 'Cinzel', marginTop: 6, marginBottom: 0, marginLeft: -40 }}> {getCompletedGoalsCount()} </Text>
                        <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600', fontFamily: 'Cinzel', marginTop: 0 }}>goal done</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
      <HabitTrackerMobile
        showCalendarModal={showCalendarModal}
        setShowCalendarModal={setShowCalendarModal}
        isFromSeeAll={true}
        selectedArea={selectedArea}
      />
      {/* Existing Goals Bottom Sheet */}
      <Modal
        visible={showExistingGoalsSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExistingGoalsSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainerMain, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowExistingGoalsSheet(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { marginTop: 15, marginLeft: 30 }]}>Add Existing Goals</Text>
            </View>
            <ScrollView style={styles.modalContentMain} showsVerticalScrollIndicator={false}>
              {goals.filter(goal => !goal.areaId || goal.areaId !== selectedArea?.id).length > 0 ? (
                <View style={styles.goalsList}>
                  {goals
                    .filter(goal => !goal.areaId || goal.areaId !== selectedArea?.id)
                    .map(goal => (
                      <TouchableOpacity
                        key={goal.id}
                        style={[styles.goalCard, { width: '85%' }]}
                        onPress={async () => {
                          try {
                            if (!user || !selectedArea) return;
                            const goalRef = doc(db, 'users', user.uid, 'goals', goal.id);
                            await updateDoc(goalRef, { areaId: selectedArea.id });
                            setGoals(goals.map(g => 
                              g.id === goal.id ? { ...g, areaId: selectedArea.id } : g
                            ));
                            setShowExistingGoalsSheet(false);
                          } catch (error) {
                            console.error('Error adding goal to area:', error);
                            Alert.alert('Error', 'Failed to add goal to area.');
                          }
                        }}
                      >
                        <View style={styles.goalContent}>
                          <View style={{ flex: 1 }}>
                            <Text style={[
                              styles.goalTitle,
                              goal.completed && { textDecorationLine: 'line-through', color: '#9CA3AF' }
                            ]}>{goal.text || goal.title}</Text>
                          </View>
                          <Text style={styles.ellipsis}>...</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No unassigned goals available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
})

const AreaSelectionModal = memo(({ 
  showAreaSelection, 
  setShowAreaSelection, 
  handleSelectPredefinedArea,
  setShowNewAreaModal 
}: { 
  showAreaSelection: boolean
  setShowAreaSelection: (show: boolean) => void
  handleSelectPredefinedArea: (area: SelfCareArea) => void
  setShowNewAreaModal: (show: boolean) => void
}) => (
  <Modal visible={showAreaSelection} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainerMain}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAreaSelection(false)} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>What area do you want to focus on?</Text>
        </View>
        <ScrollView style={styles.modalContentMain} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.areasSelectionGrid}>
            {selfCareAreas.map((area, index) => (
              <TouchableOpacity
                key={`selection_${area.id}_${index}`}
                style={[styles.selectionAreaCard, { backgroundColor: '#000000' }]}
                onPress={() => handleSelectPredefinedArea(area)}
                activeOpacity={0.8}
              >
                <View style={styles.selectionAreaContent}>
                  <Text style={styles.selectionAreaTitle}>{area.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.orContainer}>
            <Text style={styles.orText}>OR</Text>
          </View>
          <TouchableOpacity
            style={styles.createCustomButton}
            onPress={() => {
              setShowAreaSelection(false)
              setShowNewAreaModal(true)
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#9CA3AF" />
            <Text style={styles.createCustomButtonText}>Create my own area</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
))

const centeredModalOverlay: { [key: string]: any } = {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
}

const NewAreaModal = memo(({ 
  showNewAreaModal, 
  setShowNewAreaModal, 
  newAreaName, 
  setNewAreaName, 
  handleCreateNewArea,
  isSaving
}: { 
  showNewAreaModal: boolean
  setShowNewAreaModal: (show: boolean) => void
  newAreaName: string
  setNewAreaName: (name: string) => void
  handleCreateNewArea: () => void
  isSaving: boolean
}) => {
  return (
    <Modal visible={showNewAreaModal} animationType="fade" transparent>
      <View style={styles.centeredModalOverlay}>
        <View style={styles.newAreaModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewAreaModal(false)} style={styles.absoluteCloseButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.centeredModalTitle}>Create a new area</Text>
          </View>
          <View style={styles.newAreaModalContent}>
            <TextInput
              style={styles.newAreaInput}
              placeholder="Enter area name"
              value={newAreaName}
              onChangeText={setNewAreaName}
              autoFocus
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />
            <TouchableOpacity
              style={[
                styles.saveButton, 
                { 
                  opacity: newAreaName.trim() && !isSaving ? 1 : 0.5,
                  backgroundColor: isSaving ? '#9CA3AF' : '#7DD3FC'
                }
              ]}
              onPress={handleCreateNewArea}
              disabled={!newAreaName.trim() || isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
})

const HabitTrackerMobile = memo(({ 
  showCalendarModal, 
  setShowCalendarModal,
  isFromSeeAll = false,
  selectedArea
}: { 
  showCalendarModal: boolean
  setShowCalendarModal: (show: boolean) => void
  isFromSeeAll?: boolean
  selectedArea: SelfCareArea | null
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { goals, setGoals } = useGoals();
  const { user } = useAuth();

  // Reset to current month when modal opens
  useEffect(() => {
    if (showCalendarModal) {
      setCurrentMonth(new Date());
    }
  }, [showCalendarModal]);

  // Toggle goal completion
  const toggleGoalCompletion = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal || !user) return;

      const now = new Date();
      const completionData = {
        completedAt: now.toISOString(),
        notes: '',
        energy: 5,
      };

      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      
      if (goal.status === 'active') {
        // Mark as completed
        await updateDoc(goalRef, {
          status: 'completed',
          lastCompletedAt: now.toISOString(),
          totalCompletions: increment(1),
          completions: arrayUnion(completionData),
        });
      } else {
        // Mark as active again
        await updateDoc(goalRef, {
          status: 'active',
          lastCompletedAt: null,
        });
      }

      // Update local state
      setGoals(goals => goals.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              status: g.status === 'active' ? 'completed' : 'active',
              lastCompletedAt: g.status === 'active' ? now.toISOString() : null,
              totalCompletions: g.status === 'active' ? (g.totalCompletions || 0) + 1 : g.totalCompletions,
              completions: g.status === 'active' 
                ? [...(g.completions || []), completionData]
                : g.completions,
            }
          : g
      ));
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      Alert.alert('Error', 'Failed to update goal completion status.');
    }
  };

  // Check if goal was completed on selected date
  const isGoalCompletedOnDate = (goal: any, date: Date) => {
    if (!goal.completions || !Array.isArray(goal.completions)) return false;
    
    // Create date objects with time set to midnight for accurate comparison
    const selectedDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    return goal.completions.some(completion => {
      const completionDate = new Date(completion.completedAt);
      // Adjust for timezone offset
      const localCompletionDate = new Date(completionDate.getTime() + completionDate.getTimezoneOffset() * 60000);
      return localCompletionDate >= selectedDateStart && localCompletionDate < selectedDateEnd;
    });
  };

  // Get goals for selected date
  const getGoalsForDate = (date: Date) => {
    // Create date objects with time set to midnight for accurate comparison
    const selectedDateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    return goals.filter(goal => {
      // First filter by area
      if (selectedArea && goal.areaId !== selectedArea.id) {
        return false;
      }

      // Get goal's start date
      const goalDate = new Date(goal.startDate);
      // Adjust for timezone offset
      const localGoalDate = new Date(goalDate.getTime() + goalDate.getTimezoneOffset() * 60000);
      const goalDateStart = new Date(localGoalDate.getFullYear(), localGoalDate.getMonth(), localGoalDate.getDate());

      // For completed goals, check completions array FIRST
      // This ensures we can see completion history regardless of start date
      if (goal.completions && Array.isArray(goal.completions)) {
        const hasCompletion = goal.completions.some(completion => {
          const completionDate = new Date(completion.completedAt);
          // Adjust for timezone offset
          const localCompletionDate = new Date(completionDate.getTime() + completionDate.getTimezoneOffset() * 60000);
          return localCompletionDate >= selectedDateStart && localCompletionDate < selectedDateEnd;
        });
        if (hasCompletion) return true;
      }
      
      // For future dates, check if the selected date is before goal's start date
      if (selectedDateStart < goalDateStart) {
        return false;
      }
      
      // For repeating goals, check if the selected date matches the pattern
      if (goal.repeat) {
        const pattern = goal.repeat.pattern;
        const exclusions = goal.repeat.exclusions || [];
        const dateStr = selectedDateStart.toISOString().split('T')[0];
        
        // If date is excluded, don't show the goal
        if (exclusions.includes(dateStr)) return false;
        
        // Check if date matches the recurrence pattern
        switch (pattern.frequency) {
          case 'DAILY':
            return true;
          case 'WEEKLY':
            if (pattern.byDay) {
              const dayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][selectedDateStart.getDay()];
              return pattern.byDay.includes(dayStr);
            }
            return true;
          case 'MONTHLY':
            if (pattern.byMonthDay) {
              return pattern.byMonthDay.includes(selectedDateStart.getDate().toString());
            }
            return true;
          default:
            return false;
        }
      }
      
      // For non-repeating goals, only show on their start date
      return goalDateStart.getTime() === selectedDateStart.getTime();
    });
  };

  // Get completed goals count for selected date
  const completedGoalsCount = getGoalsForDate(selectedDate).length;

  // Get active days count for current month
  const getActiveDaysCount = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    
    let activeDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const goalsForDate = getGoalsForDate(date);
      // Check if any goal was completed on this date
      const hasCompletedGoal = goalsForDate.some(goal => isGoalCompletedOnDate(goal, date));
      if (hasCompletedGoal) {
        activeDays++;
      }
    }
    return activeDays;
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + increment,
      1
    ));
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = firstDayOfMonth + daysInMonth;
    const rows = Math.ceil(totalDays / 7);

    for (let row = 0; row < rows; row++) {
      const week = [];
      for (let col = 0; col < 7; col++) {
        const dayIndex = row * 7 + col;
        const dayNumber = dayIndex - firstDayOfMonth + 1;

        if (dayIndex < firstDayOfMonth || dayNumber > daysInMonth) {
          week.push(<View key={`empty-${dayIndex}`} style={styles.calendarDay} />);
        } else {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const showTodayHighlight = isTodayDate && !isSelectedDate && !selectedDate;
          
          week.push(
            <TouchableOpacity
              key={dayNumber}
              style={[
                styles.calendarDay,
                isSelectedDate && styles.selectedDay,
                showTodayHighlight && styles.todayDay
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.calendarDayText,
                isSelectedDate && styles.selectedDayText,
                showTodayHighlight && styles.todayDayText
              ]}>
                {dayNumber}
              </Text>
              <View style={styles.activityDot} />
            </TouchableOpacity>
          );
        }
      }
      days.push(
        <View key={`week-${row}`} style={styles.calendarWeek}>
          {week}
        </View>
      );
    }
    return days;
  };

  // Get completed goals count for current month
  const getCompletedGoalsCount = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let totalCompletions = 0;
    // First filter goals by selected area
    const areaGoals = goals.filter(goal => selectedArea && goal.areaId === selectedArea.id);
    
    areaGoals.forEach(goal => {
      if (goal.completions && Array.isArray(goal.completions)) {
        goal.completions.forEach(completion => {
          const completionDate = new Date(completion.completedAt);
          // Adjust for timezone offset
          const localCompletionDate = new Date(completionDate.getTime() + completionDate.getTimezoneOffset() * 60000);
          if (localCompletionDate >= startOfMonth && localCompletionDate <= endOfMonth) {
            totalCompletions++;
          }
        });
      }
    });
    return totalCompletions;
  };

  return (
    <Modal 
      visible={showCalendarModal} 
      animationType="slide" 
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                {/* Header with Month/Year */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => setShowCalendarModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Text>
                  <View style={styles.monthControls}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                      <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.greenIcon]}>
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>{getActiveDaysCount()}</Text>
                      <Text style={styles.statLabel}>days active</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.orangeIcon]}>
                      <Ionicons name="document-text" size={20} color="white" />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>{getCompletedGoalsCount()}</Text>
                      <Text style={styles.statLabel}>goals done</Text>
                    </View>
                  </View>
                </View>

                {/* Calendar */}
                <View style={styles.calendar}>
                  {!isFromSeeAll && (
                    <View style={styles.weekDaysRow}>
                      {weekDays.map(day => (
                        <Text key={day.key} style={styles.weekDayText}>{day.label}</Text>
                      ))}
                    </View>
                  )}
                  {renderCalendarDays()}
                </View>

                {/* Selected Date Goals */}
                <View style={styles.selectedDateGoals}>
                  <Text style={styles.selectedDateTitle}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                  {getGoalsForDate(selectedDate).length > 0 ? (
                    <View style={styles.goalsList}>
                      {getGoalsForDate(selectedDate).map(goal => {
                        const isCompleted = isGoalCompletedOnDate(goal, selectedDate);
                        return (
                          <View key={goal.id} style={styles.goalCard}>
                            <View style={styles.goalContent}>
                              <View style={{ flex: 1 }}>
                                <Text style={[
                                  styles.goalTitle,
                                  isCompleted && { textDecorationLine: 'line-through', color: '#9CA3AF' }
                                ]}>{goal.text || goal.title}</Text>
                              </View>
                              <Text style={styles.ellipsis}>...</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No goals for this day</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
})

const EditAreaModal = memo(({ 
  showEditModal, 
  setShowEditModal, 
  areaToEdit, 
  handleEditArea 
}: { 
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  areaToEdit: SelfCareArea | null
  handleEditArea: (editedArea: SelfCareArea) => void
}) => {
  const [editedName, setEditedName] = useState(areaToEdit?.name || "")

  useEffect(() => {
    if (areaToEdit) {
      setEditedName(areaToEdit.name)
    }
  }, [areaToEdit])

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Please enter a name for your area')
      return
    }

    if (editedName.trim().length < 3) {
      Alert.alert('Error', 'Area name must be at least 3 characters long')
      return
    }

    if (areaToEdit) {
      handleEditArea({
        ...areaToEdit,
        name: editedName.trim()
      })
    }
  }

  return (
    <Modal visible={showEditModal} animationType="fade" transparent>
      <View style={styles.centeredModalOverlay}>
        <View style={styles.newAreaModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.absoluteCloseButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.centeredModalTitle}>Edit Area</Text>
          </View>
          <View style={styles.newAreaModalContent}>
            <TextInput
              style={styles.newAreaInput}
              placeholder="Enter area name"
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[styles.saveButton, { opacity: editedName.trim() ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!editedName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
})

const OptionsSheet = memo(({ 
  showOptionsSheet, 
  setShowOptionsSheet, 
  selectedArea,
  setShowEditModal,
  handleDeleteArea
}: { 
  showOptionsSheet: boolean
  setShowOptionsSheet: (show: boolean) => void
  selectedArea: SelfCareArea | null
  setShowEditModal: (show: boolean) => void
  handleDeleteArea: (area: SelfCareArea) => void
}) => (
  <Modal visible={showOptionsSheet} animationType="slide" transparent>
    <View style={styles.optionsOverlay}>
      <View style={styles.optionsContainer}>
        <View style={styles.optionsHeader}>
          <Text style={styles.optionsTitle}>Options</Text>
          <TouchableOpacity onPress={() => setShowOptionsSheet(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => {
            setShowOptionsSheet(false)
            setShowEditModal(true)
          }}
        >
          <Ionicons name="pencil" size={20} color="#6B7280" />
          <Text style={styles.optionText}>Edit Area</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => {
            if (selectedArea) {
              Alert.alert(
                "Delete Area",
                "Are you sure you want to delete this area? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      handleDeleteArea(selectedArea)
                      setShowOptionsSheet(false)
                    }
                  }
                ]
              )
            }
          }}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={[styles.optionText, { color: "#EF4444" }]}>Delete Area</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
))

export default function SelfCareAreaScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [currentView, setCurrentView] = useState<"main" | "detail">("main")
  const [showAreaSelection, setShowAreaSelection] = useState<boolean>(false)
  const [showNewAreaModal, setShowNewAreaModal] = useState<boolean>(false)
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false)
  const [showOptionsSheet, setShowOptionsSheet] = useState<boolean>(false)
  const [selectedArea, setSelectedArea] = useState<SelfCareArea | null>(null)
  const [newAreaName, setNewAreaName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false);

  // Use context for areas and loading
  const { userAreas, setUserAreas, isLoading, refreshAreas } = useSelfCareAreas();

  // Remove the duplicate real-time listener from the screen component
  // since we already have one in the context
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No current user found in SelfCareAreaScreen');
      return;
    }

    // Initial load of areas
    const loadAreas = async () => {
      console.log('SelfCareAreaScreen: Loading initial areas');
      await refreshAreas(loadAreasFromFirestore);
    };
    loadAreas();
  }, []);

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const loadUserData = useCallback(async () => {
    try {
      const savedUsername = await storage.getItem('username')
      if (savedUsername) {
        setUsername(savedUsername)
      }
    } catch (err) {
      console.error('Error loading username:', err)
    }
  }, [])

  // Fetch areas using context refresh
  const loadAreasFromFirestore = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      setError('Please log in to view your areas')
      return []
    }
    const userRef = doc(db, 'users', currentUser.uid)
    const areasRef = collection(userRef, 'selfCareAreas')
    const querySnapshot = await getDocs(areasRef)
    const areas: SelfCareArea[] = []
    querySnapshot.forEach((doc) => {
      areas.push({ id: doc.id, ...doc.data() } as SelfCareArea)
    })
    return areas
  }, [])

  useEffect(() => {
    loadUserData()
    if (userAreas.length === 0) {
      refreshAreas(loadAreasFromFirestore)
    } else {
      // Optionally refresh in background
      refreshAreas(loadAreasFromFirestore)
    }
    return () => {
      setSelectedArea(null)
    }
  }, [loadUserData, refreshAreas])

  const handleSelectPredefinedArea = useCallback(async (area: SelfCareArea) => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create an area')
        return
      }
      Alert.alert(
        "Create Area",
        `Are you sure you want to create the \"${area.name}\" area?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Create",
            style: "default",
            onPress: async () => {
              try {
                const newArea: Omit<SelfCareArea, 'id'> = {
                  name: area.name,
                  color: area.color,
                  emoji: area.emoji,
                  isCustom: false,
                  userId: currentUser.uid
                }
                const userRef = doc(db, 'users', currentUser.uid)
                const areasRef = collection(userRef, 'selfCareAreas')
                const docRef = await addDoc(areasRef, newArea)
                const completeArea: SelfCareArea = { ...newArea, id: docRef.id }
                setUserAreas(prev => [...prev, completeArea])
                setShowAreaSelection(false)
                Alert.alert('Success', 'Area created successfully!')
              } catch (err) {
                console.error('Error creating predefined area:', err)
                Alert.alert('Error', 'Failed to create area. Please try again.')
              }
            }
          }
        ]
      )
    } catch (err) {
      console.error('Error in handleSelectPredefinedArea:', err)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }, [setUserAreas])

  const handleCreateNewArea = useCallback(async () => {
    try {
      setIsSaving(true);
      if (!newAreaName.trim()) {
        Alert.alert('Error', 'Please enter a name for your area');
        return;
      }
      if (newAreaName.trim().length < 3) {
        Alert.alert('Error', 'Area name must be at least 3 characters long');
        return;
      }
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create an area');
        return;
      }
      
      console.log('Creating new area:', newAreaName.trim());
      const newAreaData = {
        name: newAreaName.trim(),
        color: theme.colors.primary,
        emoji: "🌟",
        isCustom: true,
        userId: currentUser.uid
      };
      
      const userRef = doc(db, 'users', currentUser.uid);
      const areasRef = collection(userRef, 'selfCareAreas');
      const docRef = await addDoc(areasRef, newAreaData);
      console.log('New area created with ID:', docRef.id);
      
      // The real-time listener in the context will handle the update
      setShowNewAreaModal(false);
      setNewAreaName("");
      Alert.alert('Success', 'Area created successfully!');
    } catch (err) {
      console.error('Error creating new area:', err);
      Alert.alert('Error', 'Failed to create area. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [newAreaName]);

  const handleEditArea = useCallback(async (editedArea: SelfCareArea) => {
    try {
      if (!editedArea.id) throw new Error('Area ID is missing')
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('No user logged in')
      const areaRef = doc(db, 'users', currentUser.uid, 'selfCareAreas', editedArea.id)
      await updateDoc(areaRef, { name: editedArea.name })
      setUserAreas(prev => prev.map(area => area.id === editedArea.id ? editedArea : area))
      setShowEditModal(false)
    } catch (err) {
      console.error('Error editing area:', err)
      Alert.alert('Error', 'Failed to edit area. Please try again.')
    }
  }, [setUserAreas])

  const handleDeleteArea = useCallback(async (areaToDelete: SelfCareArea) => {
    try {
      if (!areaToDelete.id) {
        console.error('Area ID is missing:', areaToDelete);
        Alert.alert('Error', 'Cannot delete area: Missing ID');
        return;
      }
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to delete an area');
        return;
      }

      // First, get all goals associated with this area
      const goalsRef = collection(db, 'users', currentUser.uid, 'goals');
      const q = query(goalsRef, where('areaId', '==', areaToDelete.id));
      const goalsSnapshot = await getDocs(q);
      const associatedGoals = goalsSnapshot.docs.map(doc => doc.id);
      
      // If there are no associated goals, delete the area directly
      if (associatedGoals.length === 0) {
        const areaRef = doc(db, 'users', currentUser.uid, 'selfCareAreas', areaToDelete.id);
        await deleteDoc(areaRef);
        setShowOptionsSheet(false);
        setCurrentView("main");
        Alert.alert('Success', 'Area deleted successfully!');
        return;
      }

      // If there are associated goals, show the warning
      Alert.alert(
        "Delete Area",
        `Are you sure you want to delete "${areaToDelete.name}"? This will also delete ${associatedGoals.length} associated goal${associatedGoals.length !== 1 ? 's' : ''}. This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete all associated goals first
                const deletePromises = associatedGoals.map(goalId => 
                  deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId))
                );
                await Promise.all(deletePromises);
                
                // Then delete the area
                const areaRef = doc(db, 'users', currentUser.uid, 'selfCareAreas', areaToDelete.id);
                await deleteDoc(areaRef);
                
                // The real-time listener in the context will handle the update
                setShowOptionsSheet(false);
                setCurrentView("main");
                Alert.alert('Success', `Area and ${associatedGoals.length} associated goal${associatedGoals.length !== 1 ? 's' : ''} deleted successfully!`);
              } catch (err) {
                console.error('Error during deletion:', err);
                Alert.alert('Error', 'Failed to delete area and associated goals. Please try again.');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error preparing area deletion:', err);
      Alert.alert('Error', 'Failed to prepare area deletion. Please try again.');
    }
  }, []);

  if (isLoading && userAreas.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refreshAreas(loadAreasFromFirestore)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      {currentView === "main" ? (
        <MainScreen 
          userAreas={userAreas}
          setSelectedArea={setSelectedArea}
          setCurrentView={setCurrentView}
          setShowAreaSelection={setShowAreaSelection}
          handleClose={handleClose}
          username={username}
        />
      ) : (
        <DetailScreen 
          selectedArea={selectedArea}
          setCurrentView={setCurrentView}
          setShowOptionsSheet={setShowOptionsSheet}
          setShowCalendarModal={setShowCalendarModal}
          showCalendarModal={showCalendarModal}
        />
      )}
      <AreaSelectionModal 
        showAreaSelection={showAreaSelection}
        setShowAreaSelection={setShowAreaSelection}
        handleSelectPredefinedArea={handleSelectPredefinedArea}
        setShowNewAreaModal={setShowNewAreaModal}
      />
      <NewAreaModal 
        showNewAreaModal={showNewAreaModal}
        setShowNewAreaModal={setShowNewAreaModal}
        newAreaName={newAreaName}
        setNewAreaName={setNewAreaName}
        handleCreateNewArea={handleCreateNewArea}
        isSaving={isSaving}
      />
      <HabitTrackerMobile 
        showCalendarModal={showCalendarModal}
        setShowCalendarModal={setShowCalendarModal}
        isFromSeeAll={true}
        selectedArea={selectedArea}
      />
      <OptionsSheet 
        showOptionsSheet={showOptionsSheet}
        setShowOptionsSheet={setShowOptionsSheet}
        selectedArea={selectedArea}
        setShowEditModal={setShowEditModal}
        handleDeleteArea={handleDeleteArea}
      />
      <EditAreaModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        areaToEdit={selectedArea}
        handleEditArea={handleEditArea}
      />
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 70,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 50,
    left: 20,
    zIndex: 10,
    transform: [{ scale: 1.2 }],
    padding: 8,
  },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    maxWidth: width * 0.7,
    position: "relative",
  },
  speechText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
    fontFamily: 'Cinzel',
  },
  speechTail: {
    position: "absolute",
    bottom: -6,
    left: 28,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  plantsContainer: {
    display: 'none',
  },
  plantEmoji: {
    display: 'none',
  },
  contentSection: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    height: height * 0.75,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    fontFamily: 'Cinzel',
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: 'Cinzel',
  },
  areasGrid: {
    flexDirection: "column",
    marginBottom: 24,
    gap: 16,
  },
  areaCard: {
    width: "100%",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 76,
  },
  areaCardContent: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  areaCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    fontFamily: 'Cinzel',
  },
  newAreaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "solid",
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 32,
    backgroundColor: "transparent",
    minHeight: 72,
  },
  newAreaButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
    fontFamily: 'Cinzel',
  },
  feedbackCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: Platform.OS === 'android' ? 24 : 32,
  },
  feedbackContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackText: {
    flex: 1,
    marginLeft: 12,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: 'Cinzel',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    fontFamily: 'Cinzel',
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 24 : 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainerMain: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    width: '100%',
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalCloseButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
    fontFamily: 'Cinzel',
  },
  modalContentMain: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  areasSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    gap: 16,
  },
  selectionAreaCard: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionAreaContent: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionAreaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    fontFamily: 'Cinzel',
  },
  orContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  orText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: 'Cinzel',
  },
  createCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "solid",
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 48,
    minHeight: 72,
  },
  createCustomButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
    flexShrink: 1,
    textAlign: "center",
    fontFamily: 'Cinzel',
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#7DD3FC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    fontFamily: 'Cinzel',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 0,
    transform: [{ scale: 1.2 }],
  },
  optionsButton: {
    padding: 8,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 0,
    transform: [{ scale: 1.2 }],
  },
  detailTitleSection: {
    alignItems: "center",
    paddingBottom: 32,
  },
  detailIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "white",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIconCircle: {
    width: 48,
    height: 48,
    backgroundColor: "#10B981",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    fontFamily: 'Cinzel',
  },
  detailContentSection: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    minHeight: height * 0.7,
  },
  weeklyView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dayContainer: {
    alignItems: "center",
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeDayCircle: {
    backgroundColor: "#000000",
  },
  dayText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: 'Cinzel',
  },
  activeDayText: {
    color: "white",
    fontWeight: "600",
    fontFamily: 'Cinzel',
  },
  dayProgress: {
    width: 32,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  seeAllText: {
    fontSize: 16,
    color: "#6B7280",
    marginRight: 4,
    fontFamily: 'Cinzel',
  },
  goalsSection: {
    marginBottom: 32,
  },
  goalsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 24,
    fontFamily: 'Cinzel',
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    fontFamily: 'Cinzel',
  },
  addGoalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "solid",
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 16,
    backgroundColor: "transparent",
    minHeight: 72,
  },
  addGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    fontFamily: 'Cinzel',
  },
  goalOptionsContainer: {
    marginTop: 16,
    marginBottom: 96,
    alignItems: 'center',
    gap: 12,
  },
  goalOptionButton: {
    paddingVertical: 8,
  },
  goalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalOptionText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Cinzel',
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    fontFamily: 'Cinzel',
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontFamily: 'Cinzel',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: 'Cinzel',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cinzel',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    width: '100%',
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Cinzel',
  },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenIcon: {
    backgroundColor: '#10b981',
  },
  orangeIcon: {
    backgroundColor: '#f59e0b',
  },
  statsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: -5,
    position: 'relative',
    zIndex: 1,
  },
  statContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
    alignSelf: 'flex-start',
    fontFamily: 'Cinzel',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: -5,
    alignSelf: 'flex-start',
    fontFamily: 'Cinzel',
  },
  calendar: {
    flex: 1,
    paddingHorizontal: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 40,
    textAlign: 'center',
    fontFamily: 'Cinzel',
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarDay: {
    width: 48,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#e5f7ed',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  todayDay: {
    backgroundColor: '#e5f7ed',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 6,
    fontFamily: 'Cinzel',
  },
  selectedDayText: {
    color: '#10b981',
    fontWeight: '500',
  },
  todayDayText: {
    color: '#10b981',
    fontWeight: '500',
  },
  activityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  todaySection: {
    marginTop: 32,
    alignItems: 'center',
  },
  todayHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginBottom: 24,
    fontFamily: 'Cinzel',
  },
  noGoalsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noGoalsText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Cinzel',
  },
  newAreaModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '95%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  newAreaModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  newAreaInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
  },
  absoluteCloseButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -2 }],
    zIndex: 2,
    padding: 4,
  },
  centeredModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Cinzel',
    marginTop: -3,
  },
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 24,
    marginBottom: 16,
    fontFamily: 'Cinzel',
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#374151",
    transform: [{ scale: 1.1 }],
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedEmoji: {
    borderColor: "#374151",
    backgroundColor: "#E5E7EB",
  },
  emojiText: {
    fontSize: 24,
  },
  goalsList: {
    width: '100%',
    marginBottom: 16,
    marginTop: 5,
  },
  goalCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.3,
    borderColor: '#E5E7EB',
    width: '98%',
    alignSelf: 'center',
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingRight: 42,
    minHeight: 60,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    fontFamily: 'Cinzel',
    marginTop: 5,
    paddingLeft: 20,
    lineHeight: 24,
    textAlignVertical: 'center',
  },
  goalRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ellipsis: {
    fontSize: 28,
    color: '#6B7280',
    marginRight: -20,
    fontFamily: 'Cinzel',
    fontWeight: 'bold',
    lineHeight: 28,
    textAlignVertical: 'center',
    alignSelf: 'center',
    marginTop: Platform.OS === 'android' ? -8 : 0,
  },
  energyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginRight: 12,
    fontFamily: 'Cinzel',
  },
  threeDotButton: {
    marginRight: 12,
    marginLeft: -18,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingBottom: 64,
  },
  editModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  editModalEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  editModalEditText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    marginLeft: 6,
    fontFamily: 'Cinzel',
  },
  editModalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    height: 160,
    justifyContent: 'center',
  },
  editModalGoalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Cinzel',
  },
  editModalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  editModalAction: {
    alignItems: 'center',
    flex: 1,
  },
  editModalActionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Cinzel',
  },
  editModalClose: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 12,
    alignItems: 'center',
    width: '50%',
  },
  editModalCloseCircle: {
    backgroundColor: '#d1d5db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: -8,
  },
  editModalActionIconBg: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 73,
    height: 73,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: -5,
  },
  loadingCard: {
    opacity: 0.7,
  },
  loadingPlaceholder: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 24,
    height: 24,
  },
  selectedDateGoals: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginTop: -30,
    textAlign: 'center',
    fontFamily: 'Cinzel',
  },
  completedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteSection: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    width: '75%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
}) 