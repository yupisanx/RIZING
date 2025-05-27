import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Platform, Alert, TextInput, Image, Switch, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/Icons';
import MessageModal from '../components/MessageModal';
import { MaterialIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 40;
const STATUS_BAR_HEIGHT = Platform.select({
  ios: 0,
  android: 24,
});

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [pauseModeEnabled, setPauseModeEnabled] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [energy, setEnergy] = useState(10);
  const [goals, setGoals] = useState([
    { id: "1", title: "Get out of bed", completed: true },
    { id: "2", title: "Wash my face", completed: true },
    { id: "3", title: "Drink water", completed: false },
    { id: "4", title: "Take a stretch break", completed: false },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [editGoalId, setEditGoalId] = useState(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'PressStart2P': require('../assets/fonts/PressStart2P-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const maxEnergy = 15;
  const energyPerGoal = 5;
  const completedGoals = goals.filter((goal) => goal.completed).length;

  const toggleGoalCompletion = (id) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const newCompleted = !goal.completed;
          setEnergy((prev) =>
            newCompleted ? Math.min(prev + energyPerGoal, maxEnergy) : Math.max(prev - energyPerGoal, 0),
          );
          return { ...goal, completed: newCompleted };
        }
        return goal;
      }),
    );
  };

  const addGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal = {
        id: Date.now().toString(),
        title: newGoalTitle.trim(),
        completed: false,
      };
      setGoals([...goals, newGoal]);
      setNewGoalTitle("");
      setIsAddingGoal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The navigation will happen automatically when user becomes null
      // due to the conditional rendering in AppNavigator
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
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
          onPress={() => navigation.navigate('Menu')}
        >
          <Icons name="menu" size={34} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[
          styles.avatarContainer,
          {
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [-100, 0, 100, 200],
                outputRange: [50, 0, -50, -100],
                extrapolate: 'clamp'
              })
            }]
          }
        ]}>
          <Image
            source={require('../assets/avatars/chibi-avatar.png')}
            style={styles.chibiAvatar}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={[styles.mainContent, { minHeight: height * 0.8 }]}>
          <View style={[styles.goalsHeader, { paddingTop: 18 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View style={styles.energyIconCol}>
                <View style={[styles.energyIconMiddle, { transform: [{ scale: 2 }] }]}>
                  <Text style={styles.energyIconText}>⚡</Text>
                </View>
              </View>
              <View style={styles.headerRightCol}>
                <Text style={[styles.title, { marginBottom: 10, fontSize: 12 }]}>Daily Quest</Text>
                <View style={[styles.progressContainer, { marginTop: 5 }]}>
                  <View style={[styles.progressBackground, { width: '98%', alignSelf: 'flex-start', marginLeft: 0 }]}> 
                    <View style={[styles.progressFill, { width: `${(energy / maxEnergy) * 100}%` }]} />
                    <Text style={styles.progressText}>
                      {energy} / {maxEnergy}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.goalsLeft}>{goals.length - completedGoals} goals left for today!</Text>

          <View style={styles.goalsList}>
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalContent}>
                  <TouchableOpacity onPress={() => setEditGoalId(goal.id)} style={styles.threeDotButton}>
                    <MaterialIcons name="more-vert" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={[styles.goalTitle, { fontFamily: 'PressStart2P' }]}>{goal.title}</Text>
                  <View style={styles.goalRight}>
                    <Text style={[styles.energyValue, { fontFamily: 'PressStart2P' }]}>5⚡</Text>
                    <TouchableOpacity
                      onPress={() => toggleGoalCompletion(goal.id)}
                      style={[styles.checkContainer, goal.completed ? styles.checkCompleted : {}]}
                    >
                      {goal.completed && <MaterialIcons name="check" size={24} color="#22C55E" />}
                    </TouchableOpacity>
                  </View>
                </View>
                <Modal
                  visible={editGoalId === goal.id}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setEditGoalId(null)}
                >
                  <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContent}>
                      <TouchableOpacity style={styles.editModalEditButton}>
                        <MaterialIcons name="edit" size={30} color="#FBBF24" />
                        <Text style={styles.editModalEditText}>Edit</Text>
                      </TouchableOpacity>
                      <View style={styles.editModalCard}>
                        <Text style={styles.editModalGoalTitle}>{goal.title}</Text>
                        <Text style={styles.editModalGoalSub}>Any time  ⟳ daily</Text>
                      </View>
                      <View style={styles.editModalActionsRow}>
                        <TouchableOpacity style={[styles.editModalAction, {marginTop: 20}]}><MaterialIcons name="mail" size={32} color="#a78bfa" /><Text style={styles.editModalActionText}>Skip</Text></TouchableOpacity>
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

          {isAddingGoal ? (
            <View style={styles.addGoalContainer}>
              <TextInput
                style={[styles.input, { fontFamily: 'PressStart2P' }]}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                placeholder="Enter goal title"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addGoal}
              />
              <TouchableOpacity style={styles.addButton} onPress={addGoal}>
                <Text style={[styles.addButtonText, { fontFamily: 'PressStart2P' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addGoalButtonContainer}>
              <TouchableOpacity 
                style={styles.addGoalButton} 
                onPress={() => navigation.navigate('Goal')}
              >
                <View style={styles.addGoalContent}>
                  <MaterialIcons name="add" size={24} color="white" />
                  <Text style={[styles.addGoalText, { fontFamily: 'PressStart2P' }]}>Add a goal</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={[styles.extraSpace, { height: height * 0.4 }]} />
      </ScrollView>
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
    paddingTop: 15,
    paddingBottom: 5,
    marginBottom: 5,
  },
  iconButton: {
    padding: 12,
    paddingLeft: 0,
    paddingTop: Platform.OS === 'android' ? 25 : 25,
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 2,
    elevation: 5,
  },
  menuScrollView: {
    flex: 1,
  },
  menuContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  fullWidthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  gridCardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginLeft: 12,
  },
  selfCareIconContainer: {
    flexDirection: "row",
    marginLeft: -4,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  goalsIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  goalsIconCheck: {
    width: 12,
    height: 12,
    backgroundColor: "#10B981",
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  insightsIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  insightsBarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 20,
  },
  insightsBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  newslettersIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  newslettersLineContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  newslettersLine: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginVertical: 1,
  },
  historyIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#FEE2E2",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  historyIconCalendar: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#F87171",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  historyIconLine: {
    width: 12,
    height: 2,
    backgroundColor: "#60A5FA",
    marginVertical: 1,
    borderRadius: 1,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  menuCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuCardTextContainer: {
    marginLeft: 12,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  menuCardSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  finchPlusCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  finchPlusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finchPlusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  finchPlusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },
  plusBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  finchPlusSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  trialButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginLeft: 12,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  inviteIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
  },
  communitiesIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#EDE9FE",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  communitiesIconDot: {
    width: 16,
    height: 16,
    backgroundColor: "#C4B5FD",
    borderRadius: 8,
  },
  rainbowBar: {
    width: 24,
    height: 12,
    borderRadius: 6,
  },
  profileIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    color: "#60A5FA",
  },
  helpIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#60A5FA",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  aboutIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#D1FAE5",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  reportIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#FEE2E2",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  noneText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
  emojiIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraSpace: {
    width: '100%',
  },
  goalsHeader: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 24,
    padding: 13,
    margin: 13,
    width: '90%',
    marginTop: -85,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyIcon: {
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    marginTop: 2,
  },
  energyIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#60a5fa',
    fontFamily: 'PressStart2P',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderRadius: 16,
    height: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '80%',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#60a5fa',
  },
  progressText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'PressStart2P',
  },
  subtitle: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'PressStart2P',
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  goalsLeft: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 0,
    alignSelf: 'center',
    fontFamily: 'PressStart2P',
  },
  goalsList: {
    width: '90%',
    marginBottom: 16,
    marginTop: 5,
  },
  goalCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.3,
    borderColor: '#9CA3AF',
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    fontFamily: 'PressStart2P',
  },
  goalRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginRight: 12,
    fontFamily: 'PressStart2P',
  },
  checkContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCompleted: {
    backgroundColor: '#1F1F1F',
  },
  addGoalContainer: {
    flexDirection: 'row',
    width: '90%',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    color: '#ffffff',
    fontFamily: 'PressStart2P',
  },
  addButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
    fontFamily: 'PressStart2P',
  },
  addGoalButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  addGoalButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 24,
    padding: 16,
    width: '90%',
    borderWidth: 0.3,
    borderColor: '#9CA3AF',
  },
  addGoalContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'PressStart2P',
  },
  placeholderText: {
    fontFamily: 'PressStart2P',
  },
  avatarContainer: {
    width: '100%',
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: HEADER_HEIGHT - 105,
  },
  chibiAvatar: {
    width: 525,
    height: 525,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingBottom: 64,
  },
  editModalContent: {
    backgroundColor: '#000',
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
  },
  editModalGoalSub: {
    color: '#666',
    fontSize: 14,
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
  energyIconCol: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  energyIconMiddle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
}); 