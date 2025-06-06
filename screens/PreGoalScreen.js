import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, Modal, StyleSheet as RNStyleSheet, Platform, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ThreeDButton from '../components/ThreeDButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return new Date(dateStr); // fallback
  return new Date(year, month - 1, day);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function PreGoalScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [todayGoals, setTodayGoals] = useState([]);
  const [editGoalId, setEditGoalId] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedGoals = [];
      querySnapshot.forEach((doc) => {
        fetchedGoals.push({ id: doc.id, ...doc.data() });
      });
      setGoals(fetchedGoals);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const filtered = goals.filter(goal => {
      const goalDate = parseLocalDate(goal.startDate);
      if (today < goalDate) return false;
      if (!goal.repeat) {
        return isSameDay(today, goalDate);
      }
      const pattern = goal.repeat.pattern;
      const exclusions = goal.repeat.exclusions || [];
      const todayStr = today.toISOString().split('T')[0];
      if (exclusions.includes(todayStr)) return false;
      switch (pattern.frequency) {
        case 'DAILY':
          return true;
        case 'WEEKLY':
          if (pattern.byDay) {
            const dayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][today.getDay()];
            return pattern.byDay.includes(dayStr);
          }
          return true;
        case 'MONTHLY':
          if (pattern.byMonthDay) {
            return pattern.byMonthDay.includes(today.getDate().toString());
          }
          return true;
        default:
          return false;
      }
    });
    setTodayGoals(filtered);
  }, [goals]);

  // Toggle completion (local only for now)
  const toggleGoalCompletion = (id) => {
    setGoals(goals => goals.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal));
  };

  // Delete goal with confirmation
  const deleteGoal = (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
              setEditGoalId(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={48} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Goals</Text>
        <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate('Goal')}>
          <View style={styles.plusButtonBg}>
            <MaterialIcons name="add" size={24} color="#D1D5DB" />
          </View>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : todayGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No goals for today.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.goalsList}>
          {todayGoals.map(goal => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalContent}>
                <TouchableOpacity onPress={() => setEditGoalId(goal.id)} style={styles.threeDotButton}>
                  <MaterialIcons name="more-vert" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalTitle, { fontFamily: 'Cinzel', marginTop: 10 }]}>{goal.text || goal.title}</Text>
                </View>
                <View style={styles.goalRight}>
                  <TouchableOpacity onPress={() => setEditGoalId(goal.id)} style={[styles.threeDotButton, { marginRight: 15 }]}>
                    <MaterialIcons name="more-horiz" size={24} color="#fff" />
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
                  <View style={{ ...RNStyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' }} />
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 35 : 20,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  backButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -5,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  plusButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -5,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    flex: 1,
  },
  goalsList: {
    paddingBottom: 120,
    marginTop: 100,
  },
  goalCard: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    width: '87%',
    alignSelf: 'center',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Cinzel',
    marginBottom: 8,
  },
  goalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: -5,
  },
  energyValue: {
    fontSize: 14,
    color: '#A1A1AA',
    fontFamily: 'Cinzel',
  },
  threeDotButton: {
    marginRight: 12,
    marginLeft: -18,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Cinzel',
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
  plusButtonBg: {
    backgroundColor: '#27272A',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 