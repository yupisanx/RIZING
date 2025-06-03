import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data (replace with real data from context or props)
const currentStreak = 12;
const longestStreak = 12;
const streakRepairs = 2;
const streakDays = ['2025-06-02', '2025-06-03']; // ISO strings for highlighted days
const today = '2025-06-03';

const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);

// Replace calendar UI
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const daysInMonth = 30; // For June 2025
const firstDayOfMonth = new Date(2025, 5, 1).getDay(); // 0=Sun, 1=Mon, ...

function renderCalendarGrid() {
  const days = [];
  let dayNumber = 1;
  for (let row = 0; row < 6; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      // Calculate if this cell should be empty or a day
      if ((row === 0 && col < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1)) || dayNumber > daysInMonth) {
        week.push(<View key={`empty-${row}-${col}`} style={styles.calendarDay} />);
      } else {
        const dateStr = `2025-06-${dayNumber.toString().padStart(2, '0')}`;
        const isStreak = streakDays.includes(dateStr);
        const isToday = dateStr === today;
        week.push(
          <View key={dayNumber} style={[
            styles.calendarDay,
            isStreak && styles.streakDay,
            isToday && styles.todayBadge
          ]}>
            <Text style={[
              styles.calendarDayText,
              isStreak && styles.streakDayText,
              isToday && styles.todayText
            ]}>{dayNumber}</Text>
          </View>
        );
        dayNumber++;
      }
    }
    days.push(
      <View key={`week-${row}`} style={styles.calendarWeek}>
        {week}
      </View>
    );
  }
  return days;
}

export default function StreakScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  // For navigation, you can later add month state and logic
  const handlePrevMonth = () => {};
  const handleNextMonth = () => {};
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtnCircle} onPress={onClose}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Streak Badge */}
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakText}>day streak!</Text>
            <Text style={styles.streakSubText}>Open the app and visit Wobbles every day to maintain your self-care streak!</Text>
            <Text style={styles.streakLongest}>Longest: {longestStreak} days</Text>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 8 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowCircle}>
                <Text style={{ color: '#9CA3AF', fontSize: 20, fontFamily: 'Cinzel', textAlign: 'center' }}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={[styles.calendarMonth, { flex: 1, textAlign: 'center' }]}>Jun 2025</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowCircle}>
                <Text style={{ color: '#9CA3AF', fontSize: 20, fontFamily: 'Cinzel', textAlign: 'center' }}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.weekDaysRow}>
              {weekDays.map((d, i) => (
                <Text key={i} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>
            {renderCalendarGrid()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.95,
    backgroundColor: '#000000',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  closeBtnCircle: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -12,
    fontFamily: 'Cinzel',
  },
  streakText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: -8,
    fontFamily: 'Cinzel',
  },
  streakSubText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Cinzel',
  },
  streakLongest: {
    fontSize: 15,
    color: '#fff',
    marginTop: 2,
    fontWeight: '600',
    fontFamily: 'Cinzel',
  },
  calendarContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 16,
    width: '115%',
    marginTop: 42,
    alignItems: 'center',
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Cinzel',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  weekDayText: {
    width: 32,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Cinzel',
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  streakDay: {
    backgroundColor: '#FBBF24',
    borderWidth: 2,
    borderColor: '#fff',
  },
  streakDayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
  },
  todayBadge: {
    borderWidth: 2,
    borderColor: '#A16207',
  },
  calendarDayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Cinzel',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cinzel',
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
}); 