"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import DateTimeBottomSheet from "../components/DateTimeBottomSheet"
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, getDocs, collection as fsCollection } from 'firebase/firestore';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FREQUENCY, createPattern } from '../utils/recurrence';

const { height } = Dimensions.get('window');

export default function GoalScreen({ navigation, route }) {
  const [goalText, setGoalText] = useState("")
  const [showRepeatModal, setShowRepeatModal] = useState(false)
  const [showCustomContent, setShowCustomContent] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [repeatOption, setRepeatOption] = useState("Every day")
  const [endOption, setEndOption] = useState("Never")
  const [showEndOptions, setShowEndOptions] = useState(false)
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState("Today")
  const [selectedTime, setSelectedTime] = useState("Any time")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)
  const [frequencyType, setFrequencyType] = useState("Daily")
  const [selectedNumber, setSelectedNumber] = useState(1)
  const [frequencyValue, setFrequencyValue] = useState("1 day")
  const [selectedWeekdays, setSelectedWeekdays] = useState([])
  const [selectedDays, setSelectedDays] = useState([])
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const pickerScrollRef = useRef(null)
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const currentDayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null); // {id, name, color, emoji}
  const [userAreas, setUserAreas] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = [
    { key: 'Sun', label: 'S' },
    { key: 'Mon', label: 'M' },
    { key: 'Tue', label: 'T' },
    { key: 'Wed', label: 'W' },
    { key: 'Thu', label: 'T' },
    { key: 'Fri', label: 'F' },
    { key: 'Sat', label: 'S' }
  ];

  // Fetch user self-care areas
  useEffect(() => {
    if (!user) return;
    const fetchAreas = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const areasRef = fsCollection(userRef, 'selfCareAreas');
        const querySnapshot = await getDocs(areasRef);
        const areas = [];
        querySnapshot.forEach((doc) => {
          areas.push({ id: doc.id, ...doc.data() });
        });
        setUserAreas(areas);
      } catch (err) {
        console.error('Error fetching self-care areas:', err);
      }
    };
    fetchAreas();
  }, [user]);

  const handleEndDateSelect = (day) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent selecting past dates
    if (selectedDateObj < today) {
      return;
    }

    // Use unified handler to store as ISO string
    handleDateTimeSelect(selectedDateObj);
    setSelectedCalendarDate(day);
    const newDate = `${months[currentMonth.getMonth()]} ${day}, ${currentMonth.getFullYear()}`;
    setEndOption(`Ends on ${newDate}`);
    setShowEndCalendar(false);
    setShowEndOptions(false);
  };

  const renderCalendarView = () => {
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
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
        </View>
        <View style={styles.daysHeader}>
          {daysOfWeek.map((day) => (
            <Text key={day.key} style={styles.dayHeader}>{day.label}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {renderDays()}
        </View>
      </View>
    );
  };

  const renderDays = () => {
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
            selectedCalendarDate === day && !isPastDay && styles.selectedDayButton,
            new Date().getDate() === day && 
            new Date().getMonth() === currentMonth.getMonth() && 
            new Date().getFullYear() === currentMonth.getFullYear() && 
            styles.todayButton,
            isPastDay && styles.pastDayButton
          ]}
          onPress={() => handleEndDateSelect(day)}
          disabled={isPastDay}
        >
          <Text style={[
            styles.dayText, 
            selectedCalendarDate === day && !isPastDay && styles.selectedDayText,
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

    // Add an extra empty space at the end to shift everything right
    days.push(<View key="extra-space" style={styles.dayButton} />);

    return days;
  };

  const handleSave = async () => {
    if (!goalText.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a goal');
      return;
    }

    try {
      setLoading(true);

      // Convert selected date to ISO string (YYYY-MM-DD)
      let isoDate;
      if (selectedDate === 'Today') {
        const today = new Date();
        isoDate = today.toISOString().split('T')[0];
      } else if (selectedDate === 'Tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        isoDate = tomorrow.toISOString().split('T')[0];
      } else {
        const date = new Date(selectedDate);
        isoDate = date.toISOString().split('T')[0];
      }

      // Determine repeat pattern based on selections
      let repeatPattern = null;
      if (repeatOption === 'Every day') {
        repeatPattern = createPattern(FREQUENCY.DAILY);
      } else if (repeatOption === 'Every week') {
        repeatPattern = createPattern(FREQUENCY.WEEKLY, {
          days: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
        });
      } else if (repeatOption === 'Every month') {
        repeatPattern = createPattern(FREQUENCY.MONTHLY, {
          days: [isoDate.split('-')[2]]
        });
      }

      // Create the goal document with new structure
      const goalData = {
        text: goalText,
        startDate: isoDate,
        time: selectedTime,
        repeat: repeatPattern ? {
          pattern: repeatPattern,
          modifications: {},
          exclusions: []
        } : null,
        status: 'active', // Changed from 'pending' to 'active'
        userId: user.uid,
        createdAt: serverTimestamp(),
        areaId: selectedArea ? selectedArea.id : null,
        areaName: selectedArea ? selectedArea.name : null,
        areaColor: selectedArea ? selectedArea.color : null,
        areaEmoji: selectedArea ? selectedArea.emoji : null,
        completions: [], // New field to track completions
        lastCompletedAt: null, // New field to track last completion
        totalCompletions: 0, // New field to track total completions
      };

      // Save to Firestore
      const goalRef = await addDoc(collection(db, 'users', user.uid, 'goals'), goalData);

      // Only reset the goal text, keep other selections
      setGoalText('');
      
      // Show success message
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add utility functions for recurrence
  const generateInstances = (goal, startDate, endDate) => {
    if (!goal.repeat) {
      return [{
        date: goal.startDate,
        text: goal.text,
        time: goal.time,
        modified: false
      }];
    }

    const instances = [];
    const pattern = goal.repeat.pattern;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      if (isValidInstance(currentDate, pattern, goal.repeat.exclusions)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const modification = goal.repeat.modifications[dateStr];
        
        instances.push({
          date: dateStr,
          text: modification?.text || goal.text,
          time: modification?.time || goal.time,
          modified: !!modification
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return instances;
  };

  const isValidInstance = (date, pattern, exclusions) => {
    const dateStr = date.toISOString().split('T')[0];
    if (exclusions.includes(dateStr)) {
      return false;
    }

    const day = date.getDay();
    const monthDay = date.getDate();

    switch (pattern.frequency) {
      case 'DAILY':
        return true;
      case 'WEEKLY':
        if (pattern.byDay) {
          const dayStr = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][day];
          return pattern.byDay.includes(dayStr);
        }
        return true;
      case 'MONTHLY':
        if (pattern.byMonthDay) {
          return pattern.byMonthDay.includes(monthDay.toString());
        }
        return true;
      default:
        return true;
    }
  };

  const modifyInstance = (goal, date, modification) => {
    if (!goal.repeat) {
      return {
        ...goal,
        text: modification.text || goal.text,
        time: modification.time || goal.time
      };
    }

    return {
      ...goal,
      repeat: {
        ...goal.repeat,
        modifications: {
          ...goal.repeat.modifications,
          [date]: {
            ...goal.repeat.modifications[date],
            ...modification
          }
        }
      }
    };
  };

  const excludeInstance = (goal, date) => {
    if (!goal.repeat) {
      return goal;
    }

    return {
      ...goal,
      repeat: {
        ...goal.repeat,
        exclusions: [...goal.repeat.exclusions, date]
      }
    };
  };

  const handleRepeatOptionClick = (option) => {
    if (option === "Custom...") {
      setShowCustomContent(true)
    } else {
      setRepeatOption(option)
      setShowRepeatModal(false)
    }
  }

  const handleBackFromCustom = () => {
    setShowCustomContent(false)
  }

  const handleCustomSave = () => {
    let customText = ""
    if (frequencyType === "Daily") {
      customText = `Every ${frequencyValue.toLowerCase()}`
    } else if (frequencyType === "Weekly") {
      customText = `Every ${frequencyValue.toLowerCase()} on ${selectedWeekdays.join(", ")}`
    } else if (frequencyType === "Monthly") {
      customText = `Every ${frequencyValue.toLowerCase()} on day ${selectedDays.join(", ")}`
    }

    setRepeatOption(customText)
    setShowCustomContent(false)
    setShowRepeatModal(false)
  }

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const toggleWeekdaySelection = (day) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== day))
    } else {
      setSelectedWeekdays([...selectedWeekdays, day])
    }
  }

  const handleDateTimeSelect = (date, time) => {
    // Always store as ISO string
    let isoDate = date;
    if (date instanceof Date) {
      isoDate = date.toISOString().slice(0, 10);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      isoDate = date; // already ISO
    } else if (date === 'Today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      isoDate = today.toISOString().slice(0, 10);
    } else if (date === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0,0,0,0);
      isoDate = tomorrow.toISOString().slice(0, 10);
    }
    setSelectedDate(isoDate);
    if (time) {
      setSelectedTime(time);
    }
  };

  const getMaxNumber = (type) => {
    switch (type) {
      case 'Weekly':
        return 52;
      case 'Monthly':
        return 12;
      default: // Daily
        return 100;
    }
  };

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
    const unit = frequencyType === 'Daily' ? 'day' : frequencyType === 'Weekly' ? 'week' : 'month';
    setFrequencyValue(`${number} ${unit}${number > 1 ? 's' : ''}`);
  };

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const itemHeight = 40;
    const selectedIndex = Math.round(y / itemHeight);
    const number = selectedIndex + 1;
    const maxNumber = getMaxNumber(frequencyType);
    
    if (number >= 1 && number <= maxNumber) {
      handleNumberSelect(number);
    }
  };

  const handleFrequencyClick = () => {
    console.log('Opening number picker');
  };

  const renderNumberPicker = () => {
    const maxNumber = getMaxNumber(frequencyType);
    const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

    return (
      <View style={styles.pickerWrapper}>
        <View style={styles.pickerContainer}>
          <ScrollView
            ref={pickerScrollRef}
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.pickerContentContainer}
          >
            {numbers.map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.pickerItem,
                  selectedNumber === number && styles.selectedPickerItem
                ]}
                activeOpacity={1}
                onPress={() => {
                  handleNumberSelect(number);
                  pickerScrollRef.current?.scrollTo({
                    y: (number - 1) * 40,
                    animated: true
                  });
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedNumber === number && styles.selectedPickerItemText
                ]}>
                  {number}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.pickerHighlight} pointerEvents="none" />
        </View>
      </View>
    );
  };

  const renderCustomContent = () => {
    return (
      <>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={handleBackFromCustom}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-left" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Custom Repeat</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.tabContainer}>
          {["Daily", "Weekly", "Monthly"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.tab, frequencyType === type && styles.activeTab]}
              onPress={() => {
                setFrequencyType(type);
                const newMax = getMaxNumber(type);
                if (selectedNumber > newMax) {
                  setSelectedNumber(1);
                }
                const unit = type === "Daily" ? "day" : type === "Weekly" ? "week" : "month";
                setFrequencyValue(`${selectedNumber > newMax ? 1 : selectedNumber} ${unit}${selectedNumber > 1 ? 's' : ''}`);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.tabText, frequencyType === type && styles.activeTabText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

          <TouchableOpacity 
          style={styles.frequencyButton}
            onPress={() => setIsPickerVisible(!isPickerVisible)}
        >
          <Text style={styles.frequencyText}>Every</Text>
          <View style={styles.frequencyValueContainer}>
            <Text style={styles.frequencyValue}>{frequencyValue}</Text>
            <Icon name={isPickerVisible ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </View>
          </TouchableOpacity>

        {isPickerVisible && renderNumberPicker()}

        {frequencyType === "Weekly" && (
          <View style={styles.weekdayContainer}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <TouchableOpacity
                key={day + index}
                style={[
                  styles.weekdayButton,
                  selectedWeekdays.includes(day) && styles.selectedWeekdayButton
                ]}
                onPress={() => toggleWeekdaySelection(day)}
              >
                <Text style={[
                  styles.weekdayText,
                  selectedWeekdays.includes(day) && styles.selectedWeekdayText
                ]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {frequencyType === "Monthly" && (
          <ScrollView 
            style={styles.monthDayScrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.monthDayContainer}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.selectedDayButton
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDays.includes(day) && styles.selectedDayText
                  ]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </>
    );
  };

  const renderRepeatModal = () => (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRepeatModal}
      onRequestClose={() => {
        if (showEndCalendar) {
          setShowEndCalendar(false);
        } else if (showCustomContent) {
          setShowCustomContent(false);
        } else {
          setShowRepeatModal(false);
        }
      }}
      >
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1}
        onPress={() => {
          if (showEndCalendar) {
            setShowEndCalendar(false);
          } else {
            setShowRepeatModal(false);
          }
        }}
      >
        <TouchableOpacity 
          style={[styles.modalContent, Platform.OS === 'ios' && styles.modalContentIOS]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {showEndCalendar ? (
            renderCalendarView()
          ) : showCustomContent ? (
            renderCustomContent()
          ) : (
            <>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowRepeatModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Repeat</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.optionItemContainer}>
              <TouchableOpacity 
                style={[styles.optionItem, repeatOption === "Does not repeat" && styles.selectedOptionItem]}
                onPress={() => handleRepeatOptionClick("Does not repeat")}
              >
                <Text style={[styles.optionText, repeatOption === "Does not repeat" && styles.selectedOptionText]}>Does not repeat</Text>
                {repeatOption === "Does not repeat" && (
                  <View style={styles.checkmark}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.optionItem}>
                <Text style={styles.optionText}>Ends</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                    onPress={() => setShowEndOptions(!showEndOptions)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.dropdownText}>{endOption}</Text>
                    <Icon name={showEndOptions ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
              </View>

                {showEndOptions && (
                  <View style={styles.endOptionsContainer}>
                    <TouchableOpacity
                      style={[styles.endOptionButton, endOption === "Never" && styles.selectedOptionItem]}
                      onPress={() => {
                        setEndOption("Never");
                        setShowEndOptions(false);
                        setShowEndCalendar(false);
                      }}
                    >
                      <Text style={[styles.optionText, endOption === "Never" && styles.selectedOptionText]}>Never</Text>
                      {endOption === "Never" && (
                        <View style={styles.checkmark}>
                          <Icon name="check" size={20} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.endOptionButton, endOption.startsWith("Ends on") && styles.selectedOptionItem]}
                      onPress={() => {
                        setShowEndCalendar(true);
                      }}
                    >
                      <Text style={[styles.optionText, endOption.startsWith("Ends on") && styles.selectedOptionText]}>On a date</Text>
                      <Icon name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}

              <View style={styles.optionsList}>
                {[
                  "Every day",
                  "Every weekday",
                  `Every week on ${currentDayShort}`,
                  `Every month on the ${(() => {
                    const day = new Date().getDate();
                    const j = day % 10, k = day % 100;
                    if (j === 1 && k !== 11) return day + 'st';
                    if (j === 2 && k !== 12) return day + 'nd';
                    if (j === 3 && k !== 13) return day + 'rd';
                    return day + 'th';
                  })()}`,
                  "Custom..."
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, repeatOption === option && styles.selectedOptionItem]}
                    onPress={() => handleRepeatOptionClick(option)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={styles.optionButtonContent}>
                      <Text style={[styles.optionButtonText, repeatOption === option && styles.selectedOptionText]}>
                        {option}
                      </Text>
                      {repeatOption === option && (
                        <View style={styles.checkmark}>
                          <Icon name="check" size={20} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      </Modal>
    );

  // When opening the calendar, sync currentMonth to selectedDate if possible
  const openCalendar = () => {
    let baseDate = new Date();
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      baseDate = new Date(year, month - 1, day);
    }
    setCurrentMonth(baseDate);
    setShowDateTimePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon name="target" size={24} color="#000" />
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="x" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.input}
          value={goalText}
          onChangeText={setGoalText}
          placeholder="Enter your goal"
          placeholderTextColor="#999"
          autoFocus
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.option}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setShowAreaModal(true)}
          >
            <View style={styles.optionIcon}>
              <Icon name="plus" size={20} color="#000" />
            </View>
            <Text style={styles.optionText}>
              {selectedArea ? selectedArea.name : 'Add to an area'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={openCalendar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.optionIcon}>
              <Icon name="calendar" size={20} color="#000" />
            </View>
            <Text style={styles.optionText}>{(() => {
              const today = new Date();
              today.setHours(0,0,0,0);
              if (selectedDate === 'Today' || !selectedDate) {
                return `TODAY${selectedTime !== "Any time" ? ", " + selectedTime : ""}`;
              } else if (selectedDate === 'Tomorrow') {
                const tmr = new Date(today);
                tmr.setDate(today.getDate() + 1);
                return `TOMORROW${selectedTime !== "Any time" ? ", " + selectedTime : ""}`;
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
                // ISO string: YYYY-MM-DD
                const [year, month, day] = selectedDate.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                return `${weekday}, ${monthStr} ${day}${selectedTime !== "Any time" ? ", " + selectedTime : ""}`;
              } else {
                // Try to parse e.g. '2024-05-06' or 'April 27, 2024'
                const parsed = new Date(selectedDate);
                if (!isNaN(parsed)) {
                  const weekday = parsed.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const monthStr = parsed.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  return `${weekday}, ${monthStr} ${parsed.getDate()}${selectedTime !== "Any time" ? ", " + selectedTime : ""}`;
                }
                return `${selectedDate}${selectedTime !== "Any time" ? ", " + selectedTime : ""}`;
              }
            })()}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option} 
            onPress={() => setShowRepeatModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.optionIcon}>
              <Icon name="repeat" size={20} color="#000" />
            </View>
            <Text style={styles.optionText}>{repeatOption}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.moreOptionsText}>More options</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderRepeatModal()}
      <DateTimeBottomSheet 
        visible={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        onDateTimeSelect={handleDateTimeSelect}
      />

      {/* Area Selection Modal */}
      <Modal
        visible={showAreaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAreaModal(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowAreaModal(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, Platform.OS === 'ios' && styles.modalContentIOS]}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Choose a Self-Care Area</Text>
            <ScrollView 
              style={styles.areaList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <TouchableOpacity
                style={[styles.areaOption, selectedArea === null && styles.selectedAreaOption]}
                onPress={() => { setSelectedArea(null); }}
              >
                <Text style={styles.areaOptionText}>None</Text>
                {selectedArea === null && <Icon name="check-circle" size={22} color="#000" />}
              </TouchableOpacity>
              {userAreas.map(area => (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.areaOption, selectedArea?.id === area.id && styles.selectedAreaOption]}
                  onPress={() => { setSelectedArea(area); }}
                >
                  <View style={styles.areaOptionContent}>
                    <Text style={styles.areaOptionText}>{area.name}</Text>
                  </View>
                  {selectedArea?.id === area.id && <Icon name="check-circle" size={22} color="#000" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowAreaModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    margin: 6,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
    minHeight: height * 0.4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 50,
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 12,
    marginTop: 8,
  },
  input: {
    fontSize: 16,
    marginBottom: 20,
    padding: 0,
    fontFamily: 'Cinzel',
  },
  optionsContainer: {
    marginBottom: -20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 50,
  },
  optionIcon: {
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderRadius: 50,
    marginRight: 10,
  },
  optionText: {
    color: "#666",
    fontSize: 14,
    fontFamily: 'Cinzel-Regular',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  },
  moreOptionsText: {
    color: "#666",
    fontSize: 14,
    fontFamily: 'Cinzel',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 36,
    borderRadius: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Cinzel',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainerIOS: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '65%',
    width: '100%',
  },
  modalContentIOS: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Cinzel'
  },
  optionItemContainer: {
    marginBottom: 12,
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
  selectedOptionItem: {
    backgroundColor: "#f0f0f0"
  },
  checkmark: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownText: {
    color: "#666",
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'Cinzel-Regular',
  },
  optionsList: {
    marginTop: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  optionButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  optionButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: 'Cinzel-Regular',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: "#999",
    fontSize: 16,
    fontFamily: 'Cinzel',
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  optionLabel: {
    color: "#666",
    fontSize: 16,
    fontFamily: 'Cinzel',
  },
  weekdayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedWeekdayButton: {
    backgroundColor: "#000",
  },
  weekdayText: {
    fontSize: 14,
    color: "#666",
    fontFamily: 'Cinzel',
  },
  selectedWeekdayText: {
    color: "#fff",
  },
  saveButtonContainer: {
    alignItems: "flex-end",
    marginTop: 16,
  },
  selectedOptionText: {
    color: "#000",
    fontWeight: "500",
    fontFamily: 'Cinzel',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalInner: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  verticalPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    height: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Cinzel',
  },
  pickerValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 4,
    fontFamily: 'Cinzel',
  },
  pickerArrow: {
    marginTop: 2,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 16,
    height: 140,
    padding: 0,
    width: '100%',
  },
  pickerContainer: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  pickerScrollView: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  pickerContentContainer: {
    paddingVertical: 0,
    width: '100%',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  selectedPickerItem: {
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    width: '100%',
    alignSelf: 'center',
  },
  pickerItemText: {
    fontSize: 22,
    color: '#222',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    opacity: 0.4,
  },
  selectedPickerItemText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 26,
    opacity: 1,
  },
  pickerHighlight: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 12,
    zIndex: 2,
    pointerEvents: 'none',
    width: '100%',
  },
  pickerGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#f5f5f5',
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#f5f5f5',
    zIndex: 1,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  verticalPicker: {
    height: 150,
  },
  pickerContent: {
    paddingVertical: 55,
  },
  pickerPadding: {
    height: 100,
  },
  numberItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '400',
    fontFamily: 'Cinzel',
  },
  selectedNumberText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Cinzel',
  },
  pickerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    zIndex: 2,
  },
  pickerGradientTop: {
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pickerGradientBottom: {
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  collapsedContainer: {
    height: 'auto',
  },
  endOptionsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginTop: -8,
    marginBottom: 12,
    overflow: 'hidden'
  },
  endOptionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    paddingTop: 15,
    marginTop: 0,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: 'Cinzel-Regular',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    padding: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayHeader: {
    width: '14.28%',
    textAlign: 'center',
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 4,
    fontFamily: 'Cinzel-Regular',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: '#999999',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  todayText: {
    color: '#333',
    fontWeight: '600',
  },
  pastDayButton: {
    opacity: 0.8,
  },
  pastDayText: {
    color: '#999999',
  },
  frequencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  frequencyText: {
    fontSize: 16,
    color: "#666",
    fontFamily: 'Cinzel',
  },
  frequencyValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  frequencyValue: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
    fontFamily: 'Cinzel',
  },
  monthDayScrollView: {
    maxHeight: 160,
    marginBottom: 20,
  },
  monthDayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  selectedDayButton: {
    backgroundColor: "#333",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#666",
    fontFamily: 'Cinzel-Regular',
  },
  selectedDayText: {
    color: "#fff",
    fontFamily: 'Cinzel-Regular',
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 36,
    borderRadius: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: 'Cinzel',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 16,
    height: 150,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerScrollView: {
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  pickerContentContainer: {
    paddingVertical: 60,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectedPickerItem: {
    backgroundColor: '#e0e0e0',
  },
  pickerItemText: {
    fontSize: 20,
    color: '#666',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    width: '100%',
  },
  selectedPickerItemText: {
    color: '#000',
    fontWeight: '600',
  },
  pickerHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    transform: [{ translateY: -20 }],
    pointerEvents: 'none',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  areaList: {
    maxHeight: height * 0.5,
    width: '100%',
  },
  areaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  selectedAreaOption: {
    backgroundColor: '#F3F4F6',
  },
  areaOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaOptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Cinzel',
  },
  doneButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 17,
    width: '100%',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Cinzel',
  },
}) 