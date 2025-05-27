import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Icon from "react-native-vector-icons/Feather";

const DateTimeBottomSheet = ({ visible, onClose, onDateTimeSelect }) => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('Any time');
  const [notifyMe, setNotifyMe] = useState(false);
  const [anyTimeEnabled, setAnyTimeEnabled] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().getDate());
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = [
    { key: 'Sun', label: 'S' },
    { key: 'Mon', label: 'M' },
    { key: 'Tue', label: 'T' },
    { key: 'Wed', label: 'W' },
    { key: 'Thu', label: 'T' },
    { key: 'Fri', label: 'F' },
    { key: 'Sat', label: 'S' },
  ];

  const handleDateSelect = (day) => {
    const newDate = `${months[currentMonth.getMonth()]} ${day}, ${currentMonth.getFullYear()}`;
    setSelectedCalendarDate(day);
    setSelectedDate(newDate);
    setCurrentView('main');
    onDateTimeSelect?.(newDate, selectedTime);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onDateTimeSelect?.(selectedDate, time);
  };

  const handlePresetTimeSelect = (preset) => {
    let time;
    switch (preset) {
      case 'Morning':
        setSelectedHour(9);
        setSelectedMinute(0);
        setSelectedPeriod('AM');
        time = '9:00 AM';
        break;
      case 'Afternoon':
        setSelectedHour(1);
        setSelectedMinute(0);
        setSelectedPeriod('PM');
        time = '1:00 PM';
        break;
      case 'Evening':
        setSelectedHour(8);
        setSelectedMinute(0);
        setSelectedPeriod('PM');
        time = '8:00 PM';
        break;
    }
    setSelectedTime(time);
    onDateTimeSelect?.(selectedDate, time);
  };

  const handleSimpleDateSelect = (date) => {
    setSelectedDate(date);
    onDateTimeSelect?.(date, selectedTime);
  };

  const renderMainView = () => (
    <View style={styles.optionItemContainer}>
      <View style={styles.section}>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Date</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dropdownText}>{selectedDate}</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleSimpleDateSelect('Today')}
          >
            <Text style={styles.optionButtonText}>Today</Text>
            {selectedDate === 'Today' && (
              <View style={styles.checkmark}>
                <Icon name="check" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleSimpleDateSelect('Tomorrow')}
          >
            <Text style={styles.optionButtonText}>Tomorrow</Text>
            {selectedDate === 'Tomorrow' && (
              <View style={styles.checkmark}>
                <Icon name="check" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setCurrentView('calendar')}
          >
            <Text style={styles.optionButtonText}>On a date...</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionItem}>
        <Text style={styles.optionText}>Time</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setCurrentView('time')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dropdownText}>{selectedTime}</Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.optionItem}>
        <Text style={styles.optionText}>Notify me</Text>
        <Switch
          value={notifyMe}
          onValueChange={setNotifyMe}
          trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    </View>
  );

  const renderCalendarView = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayButton} />);
    }

    // Add the actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPastDay = currentDate < today;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selectedCalendarDate === day && styles.selectedDayButton,
            new Date().getDate() === day && 
            new Date().getMonth() === currentMonth.getMonth() && 
            new Date().getFullYear() === currentMonth.getFullYear() && 
            styles.todayButton,
            isPastDay && styles.pastDayButton
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text style={[
            styles.dayText, 
            selectedCalendarDate === day && styles.selectedDayText,
            new Date().getDate() === day && 
            new Date().getMonth() === currentMonth.getMonth() && 
            new Date().getFullYear() === currentMonth.getFullYear() && 
            styles.todayText,
            isPastDay && styles.pastDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.daysHeader}>
            {daysOfWeek.map((day) => (
              <Text key={day.key} style={styles.dayHeader}>{day.label}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderTimeView = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.optionItemContainer}>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Any time</Text>
          <Switch
            value={anyTimeEnabled}
            onValueChange={setAnyTimeEnabled}
            trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {!anyTimeEnabled && (
          <>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handlePresetTimeSelect('Morning')}
            >
              <Text style={styles.optionButtonText}>Morning (9:00 AM)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handlePresetTimeSelect('Afternoon')}
            >
              <Text style={styles.optionButtonText}>Afternoon (1:00 PM)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handlePresetTimeSelect('Evening')}
            >
              <Text style={styles.optionButtonText}>Evening (8:00 PM)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { transform: [{ translateY: visible ? 0 : 100 }] }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                if (currentView !== 'main') {
                  setCurrentView('main');
                } else {
                  onClose();
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.headerButton}
            >
              <Icon name="x" size={24} color="#666" />
            </TouchableOpacity>
            {currentView === 'calendar' ? (
              <>
                <Text style={styles.monthTitle}>
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <View style={styles.navigationButtons}>
                  <TouchableOpacity 
                    onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} 
                    style={styles.navButton}
                  >
                    <Icon name="chevron-left" size={24} color="#999999" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} 
                    style={styles.navButton}
                  >
                    <Icon name="chevron-right" size={24} color="#999999" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {currentView === 'main' ? 'Date and time' : 'Select time'}
                </Text>
                <View style={styles.headerButton} />
              </>
            )}
          </View>

          {currentView === 'main' && renderMainView()}
          {currentView === 'calendar' && renderCalendarView()}
          {currentView === 'time' && renderTimeView()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 12,
    maxHeight: '90%',
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 0,
    paddingRight: 14,
    height: 48,
    marginTop: -8,
  },
  headerButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginLeft: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: 'center',
  },
  optionItemContainer: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionText: {
    color: "#666",
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownText: {
    color: "#666",
    fontSize: 14,
    marginRight: 4,
  },
  optionsList: {
    marginTop: 16,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionButtonText: {
    color: "#666",
    fontSize: 14,
  },
  checkmark: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  todayButton: {
    borderWidth: 1,
    borderColor: '#999999',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectedDayButton: {
    backgroundColor: "#333",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  todayText: {
    color: '#333',
    fontWeight: '600',
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginLeft: -10,
  },
  navButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  pastDayButton: {
    opacity: 0.8,
  },
  pastDayText: {
    color: '#999999',
  },
});

export default DateTimeBottomSheet; 