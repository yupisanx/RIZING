import React, { useState, useEffect, useCallback, memo } from "react"
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in SelfCareAreaScreen:', error, errorInfo)
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
      )
    }

    return this.props.children
  }
}

// Type definitions
export type SelfCareArea = {
  id: string
  name: string
  color: string
  emoji: string
  isCustom?: boolean
}

type NavigationProp = NativeStackNavigationProp<any>

const selfCareAreas: SelfCareArea[] = [
  { id: "calm", name: "Calm", color: "#86EFAC", emoji: "🧘" },
  { id: "nutrition", name: "Nutrition", color: "#4ADE80", emoji: "🥗" },
  { id: "productivity", name: "Productivity", color: "#FDE68A", emoji: "✅" },
  { id: "movement", name: "Movement", color: "#FCD34D", emoji: "🏃" },
  { id: "self-kindness", name: "Self-kindness", color: "#FB923C", emoji: "❤️" },
  { id: "sleep", name: "Sleep", color: "#A855F7", emoji: "😴" },
  { id: "gratitude", name: "Gratitude", color: "#F472B6", emoji: "🙏" },
  { id: "hygiene", name: "Hygiene", color: "#60A5FA", emoji: "🧼" },
  { id: "connection", name: "Connection", color: "#6366F1", emoji: "👥" },
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
          <Text style={styles.subtitle}>Build habits and organize my goals to care for my whole self</Text>
        </View>
        {userAreas.length > 0 && (
          <View style={styles.areasGrid}>
            {userAreas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[styles.areaCard, { backgroundColor: area.color }]}
                onPress={() => {
                  setSelectedArea(area)
                  setCurrentView("detail")
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
  setShowCalendarModal 
}: { 
  selectedArea: SelfCareArea | null
  setCurrentView: (view: "main" | "detail") => void
  setShowOptionsSheet: (show: boolean) => void
  setShowCalendarModal: (show: boolean) => void
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'personality'>('about');

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

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>ABOUT</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'personality' && styles.activeTab]} 
              onPress={() => setActiveTab('personality')}
            >
              <Text style={[styles.tabText, activeTab === 'personality' && styles.activeTabText]}>PERSONALITY</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'about' ? (
            <View style={styles.goalsSection}>
              <Text style={styles.goalsSectionTitle}>Your goals</Text>
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Text style={styles.emptyStateEmoji}>🏖️</Text>
                </View>
                <Text style={styles.emptyStateText}>You don't have any goals yet</Text>
                <TouchableOpacity style={styles.addGoalButton} activeOpacity={0.8}>
                  <Text style={styles.addGoalButtonText}>Add a new goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.personalitySection}>
              <Text style={styles.personalitySectionTitle}>Your personality traits</Text>
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Text style={styles.emptyStateEmoji}>🎭</Text>
                </View>
                <Text style={styles.emptyStateText}>No personality traits added yet</Text>
                <TouchableOpacity style={styles.addTraitButton} activeOpacity={0.8}>
                  <Text style={styles.addTraitButtonText}>Add personality traits</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
        <ScrollView style={styles.modalContentMain} showsVerticalScrollIndicator={false}>
          <View style={styles.areasSelectionGrid}>
            {selfCareAreas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[styles.selectionAreaCard, { backgroundColor: area.color }]}
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
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </View>
  </Modal>
))

const NewAreaModal = memo(({ 
  showNewAreaModal, 
  setShowNewAreaModal, 
  newAreaName, 
  setNewAreaName, 
  handleCreateNewArea 
}: { 
  showNewAreaModal: boolean
  setShowNewAreaModal: (show: boolean) => void
  newAreaName: string
  setNewAreaName: (name: string) => void
  handleCreateNewArea: () => void
}) => (
  <Modal visible={showNewAreaModal} animationType="fade" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.newAreaModalContainer}>
        <View style={styles.newAreaModalHeader}>
          <TouchableOpacity onPress={() => setShowNewAreaModal(false)} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create a new area</Text>
        </View>
        <View style={styles.newAreaModalContent}>
          <TextInput
            style={styles.newAreaInput}
            placeholder="Enter area name"
            value={newAreaName}
            onChangeText={setNewAreaName}
            autoFocus
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[styles.saveButton, { opacity: newAreaName.trim() ? 1 : 0.5 }]}
            onPress={handleCreateNewArea}
            disabled={!newAreaName.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
))

const HabitTrackerMobile = memo(({ 
  showCalendarModal, 
  setShowCalendarModal 
}: { 
  showCalendarModal: boolean
  setShowCalendarModal: (show: boolean) => void
}) => {
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 25;

  const renderCalendarDay = (day: number) => (
    <View key={day} style={styles.calendarDay}>
      <View
        style={[
          styles.dayNumber,
          day === today && styles.todayNumber,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            day === today ? styles.todayText : styles.inactiveText,
          ]}
        >
          {day}
        </Text>
      </View>
      <View style={styles.dayIndicator} />
    </View>
  );

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
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity style={styles.navButton} onPress={() => setShowCalendarModal(false)}>
                    <Text style={styles.navIcon}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>May 2025</Text>
                  <TouchableOpacity style={styles.navButton}>
                    <Text style={styles.navIcon}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.yellowIcon]}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>✓</Text>
                      </View>
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>0</Text>
                      <Text style={styles.statLabel}>days active</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.orangeIcon]}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>📁</Text>
                      </View>
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>0</Text>
                      <Text style={styles.statLabel}>goals done</Text>
                    </View>
                  </View>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {daysInMonth.map(renderCalendarDay)}
                </View>

                {/* Today Section */}
                <View style={styles.todaySection}>
                  <Text style={styles.todayHeader}>TODAY, MAY 25</Text>

                  <View style={styles.goalCard}>
                    <View style={[styles.goalIcon, styles.yellowIcon]}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>⭐</Text>
                      </View>
                    </View>
                    <View style={styles.goalContent}>
                      <Text style={styles.goalTitle}>
                        Write down my goals for tomorrow
                      </Text>
                      <View style={styles.goalMeta}>
                        <Text style={styles.smallIcon}>↻</Text>
                        <Text style={styles.goalFrequency}>daily</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Text style={styles.navIcon}>⋯</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const OptionsSheet = memo(({ 
  showOptionsSheet, 
  setShowOptionsSheet, 
  selectedArea 
}: { 
  showOptionsSheet: boolean
  setShowOptionsSheet: (show: boolean) => void
  selectedArea: SelfCareArea | null
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
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="pencil" size={20} color="#6B7280" />
          <Text style={styles.optionText}>Edit Area</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
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
  const [userAreas, setUserAreas] = useState<SelfCareArea[]>([])
  const [newAreaName, setNewAreaName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")

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

  const loadAreas = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const savedAreas = await storage.getItem('userAreas')
      if (savedAreas) {
        const parsedAreas: SelfCareArea[] = JSON.parse(savedAreas)
        setUserAreas(parsedAreas)
      }
    } catch (err) {
      setError('Failed to load areas. Please try again.')
      console.error('Error loading areas:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveAreas = useCallback(async (areas: SelfCareArea[]) => {
    try {
      setError(null)
      await storage.setItem('userAreas', JSON.stringify(areas))
    } catch (err) {
      setError('Failed to save areas. Please try again.')
      console.error('Error saving areas:', err)
    }
  }, [])

  useEffect(() => {
    loadUserData()
    loadAreas()
    return () => {
      // Cleanup
      setUserAreas([])
      setSelectedArea(null)
    }
  }, [loadUserData, loadAreas])

  const handleSelectPredefinedArea = useCallback((area: SelfCareArea) => {
    const newArea: SelfCareArea = {
      ...area,
      isCustom: false
    }
    const updatedAreas: SelfCareArea[] = [...userAreas, newArea]
    setUserAreas(updatedAreas)
    saveAreas(updatedAreas)
    setShowAreaSelection(false)
  }, [userAreas, saveAreas])

  const handleCreateNewArea = useCallback(() => {
    if (!newAreaName.trim()) {
      Alert.alert('Error', 'Please enter a name for your area')
      return
    }

    if (newAreaName.trim().length < 3) {
      Alert.alert('Error', 'Area name must be at least 3 characters long')
      return
    }

    const newArea: SelfCareArea = {
      id: Date.now().toString(),
      name: newAreaName.trim(),
      color: theme.colors.primary,
      emoji: "🌟",
      isCustom: true
    }

    const updatedAreas: SelfCareArea[] = [...userAreas, newArea]
    setUserAreas(updatedAreas)
    saveAreas(updatedAreas)
    setShowNewAreaModal(false)
    setNewAreaName("")
  }, [newAreaName, userAreas, saveAreas])

  if (isLoading) {
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
        <TouchableOpacity style={styles.retryButton} onPress={loadAreas}>
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
      />
      <HabitTrackerMobile 
        showCalendarModal={showCalendarModal}
        setShowCalendarModal={setShowCalendarModal}
      />
      <OptionsSheet 
        showOptionsSheet={showOptionsSheet}
        setShowOptionsSheet={setShowOptionsSheet}
        selectedArea={selectedArea}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
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
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 20,
    maxWidth: width * 0.8,
    position: "relative",
  },
  speechText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  speechTail: {
    position: "absolute",
    bottom: -8,
    left: 32,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
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
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  areasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  areaCard: {
    width: (width - 72) / 2,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  areaCardContent: {
    padding: 24,
    alignItems: "center",
  },
  areaCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  newAreaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  newAreaButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
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
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 24 : 32,
  },
  modalContainerMain: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    width: '100%',
    overflow: 'hidden',
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
  },
  modalContentMain: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  areasSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 16,
  },
  selectionAreaCard: {
    width: ((width - 48) / 2) / 1.2,
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
  },
  orContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  orText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  createCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 48,
  },
  createCustomButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
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
  },
  activeDayText: {
    color: "white",
    fontWeight: "600",
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
  },
  goalsSection: {
    marginBottom: 32,
  },
  goalsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    backgroundColor: "#DBEAFE",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateEmoji: {
    fontSize: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  addGoalButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  addGoalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  addExistingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  addExistingButtonText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
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
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowIcon: {
    backgroundColor: '#fbbf24',
  },
  orangeIcon: {
    backgroundColor: '#fb923c',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: (width - 48 - 96) / 7,
    alignItems: 'center',
    gap: 8,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayNumber: {
    backgroundColor: '#fef3c7',
  },
  todayText: {
    color: '#111827',
  },
  inactiveText: {
    color: '#9ca3af',
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  todaySection: {
    marginBottom: 24,
  },
  todayHeader: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  goalFrequency: {
    fontSize: 14,
    color: '#6b7280',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  newAreaModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    width: '100%',
    overflow: 'hidden',
  },
  newAreaModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  newAreaModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#60A5FA',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  personalitySection: {
    paddingHorizontal: 16,
  },
  personalitySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  addTraitButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
  },
  addTraitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
}) 