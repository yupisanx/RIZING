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
import { MaterialIcons } from '@expo/vector-icons';
import Calendar from 'react-native-calendars/src/calendar';

const DateTimeBottomSheet = ({ 
  visible, 
  onClose, 
  onDateTimeSelect,
  hideTimeSelection = false,
  title = "Date & Time" 
}) => {
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

  // Add scroll refs
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const periodScrollRef = useRef(null);

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

  // Format hours without leading zeros (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Create an array with extra items for circular scrolling
  const getCircularMinutes = () => {
    // Add last hour at the beginning and first hour at the end
    const circularMinutes = [];
    // Add last few minutes at the start
    for (let i = 57; i <= 59; i++) {
      circularMinutes.push(i.toString().padStart(2, '0'));
    }
    // Add all minutes
    for (let i = 0; i < 60; i++) {
      circularMinutes.push(i.toString().padStart(2, '0'));
    }
    // Add first few minutes at the end
    for (let i = 0; i <= 2; i++) {
      circularMinutes.push(i.toString().padStart(2, '0'));
    }
    return circularMinutes;
  };

  const getCircularHours = () => {
    const circularHours = [];
    // Add last few hours at the start
    circularHours.push('10', '11', '12');
    // Add all hours
    for (let i = 1; i <= 12; i++) {
      circularHours.push(i.toString());
    }
    // Add first few hours at the end
    circularHours.push('1', '2', '3');
    return circularHours;
  };

  const handleHourScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const index = Math.round(y / itemHeight);
    const adjustedIndex = ((index - 3 + 12) % 12) + 1;
    setSelectedHour(adjustedIndex);
  };

  const handleMinuteScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const index = Math.round(y / itemHeight);
    const adjustedIndex = (index - 3 + 60) % 60;
    setSelectedMinute(adjustedIndex);
  };

  const handlePeriodScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const index = Math.round(y / itemHeight);
    setSelectedPeriod(index === 3 ? 'AM' : 'PM');
  };

  const isItemSelected = (index, itemHeight, scrollViewHeight) => {
    const centerY = scrollViewHeight / 2;
    const itemY = index * itemHeight;
    const itemCenterY = itemY + (itemHeight / 2);
    return Math.abs(itemCenterY - centerY) < itemHeight / 2;
  };

  const renderPickerItems = (items, selectedValue, onSelect, scrollRef, type) => {
    return (
      <ScrollView
        ref={scrollRef}
        style={type === 'period' ? styles.periodColumn : styles.pickerColumn}
        showsVerticalScrollIndicator={false}
        snapToInterval={50}
        decelerationRate="fast"
        onScroll={
          type === 'hour' 
            ? handleHourScroll 
            : type === 'minute' 
              ? handleMinuteScroll 
              : type === 'period' 
                ? handlePeriodScroll 
                : undefined
        }
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.pickerContentContainer}
      >
        <View style={{ height: 100 }} />
        {items.map((item, index) => {
          const isInGreyArea = isItemSelected(index, 50, 250);
          const isValueSelected = 
            type === 'period' 
              ? item === selectedValue
              : parseInt(item) === selectedValue;
          
          return (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[
                styles.pickerItem,
                isInGreyArea && styles.selectedPickerItem,
              ]}
              onPress={() => {
                if (type === 'period') {
                  onSelect(item);
                } else {
                  onSelect(parseInt(item));
                }
                // Scroll to position after selection
                scrollRef.current?.scrollTo({
                  y: (index - 3) * 50,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pickerItemText,
                isInGreyArea && styles.selectedPickerItemText,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const handleDateSelect = (day) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent selecting past dates
    if (selectedDateObj < today) {
      return;
    }

    // Use local date string to avoid timezone issues
    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDateObj.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${dayStr}`;
    
    setSelectedCalendarDate(day);
    setSelectedDate(isoDate);
    setCurrentView('main');
    onDateTimeSelect?.(isoDate, selectedTime);
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
    let dateToSend = date;
    
    if (date === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0,0,0,0);
      // Use local date string to avoid timezone issues
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      dateToSend = `${year}-${month}-${day}`;
    } else if (date === 'Today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      // Use local date string to avoid timezone issues
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      dateToSend = `${year}-${month}-${day}`;
    }
    
    onDateTimeSelect?.(dateToSend, selectedTime);
  };

  const handleSave = () => {
    if (hideTimeSelection) {
      onDateTimeSelect(selectedDate);
    } else {
      onDateTimeSelect(selectedDate, selectedTime);
    }
    onClose();
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
            style={[styles.optionButton, selectedDate === 'Today' && styles.selectedOptionButton]}
            onPress={() => handleSimpleDateSelect('Today')}
          >
            <View style={styles.optionButtonContent}>
              <Text style={[styles.optionButtonText, selectedDate === 'Today' && styles.selectedOptionText]}>Today</Text>
              {selectedDate === 'Today' && (
                <View style={styles.checkmark}>
                  <Icon name="check" size={20} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, selectedDate === 'Tomorrow' && styles.selectedOptionButton]}
            onPress={() => handleSimpleDateSelect('Tomorrow')}
          >
            <View style={styles.optionButtonContent}>
              <Text style={[styles.optionButtonText, selectedDate === 'Tomorrow' && styles.selectedOptionText]}>Tomorrow</Text>
              {selectedDate === 'Tomorrow' && (
                <View style={styles.checkmark}>
                  <Icon name="check" size={20} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton]}
            onPress={() => setCurrentView('calendar')}
          >
            <View style={styles.optionButtonContent}>
              <Text style={styles.optionButtonText}>On a date...</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {!hideTimeSelection && (
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
      )}

      {!hideTimeSelection && (
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>Notify me</Text>
          <Switch
            value={notifyMe}
            onValueChange={setNotifyMe}
            trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      )}
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
            selectedCalendarDate === day && !isPastDay && styles.selectedDayButton,
            new Date().getDate() === day && 
            new Date().getMonth() === currentMonth.getMonth() && 
            new Date().getFullYear() === currentMonth.getFullYear() && 
            styles.todayButton,
            isPastDay && styles.pastDayButton
          ]}
          onPress={() => handleDateSelect(day)}
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
    <View style={styles.timeViewContainer}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.anyTimeContainer}>
          <Text style={styles.optionText}>Any time</Text>
          <Switch
            value={anyTimeEnabled}
            onValueChange={setAnyTimeEnabled}
            trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={() => {
          const time = 'Any time';
          handleTimeSelect(time);
          setCurrentView('main');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDatePicker = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const selectedDateStr = selectedDate === 'Today' ? todayStr : 
                           selectedDate === 'Tomorrow' ? tomorrowStr : 
                           selectedDate;

    return (
      <View style={styles.datePickerContainer}>
        <View style={styles.simpleDateOptions}>
          <TouchableOpacity 
            style={[styles.simpleDateOption, selectedDate === 'Today' && styles.selectedOption]} 
            onPress={() => handleSimpleDateSelect('Today')}
          >
            <Text style={[styles.simpleDateText, selectedDate === 'Today' && styles.selectedText]}>Today</Text>
            {selectedDate === 'Today' && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="check" size={16} color="#000" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.simpleDateOption, selectedDate === 'Tomorrow' && styles.selectedOption]} 
            onPress={() => handleSimpleDateSelect('Tomorrow')}
          >
            <Text style={[styles.simpleDateText, selectedDate === 'Tomorrow' && styles.selectedText]}>Tomorrow</Text>
            {selectedDate === 'Tomorrow' && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="check" size={16} color="#000" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDateStr}
            minDate={todayStr}
            onDayPress={handleDateSelect}
            markedDates={{
              [selectedDateStr]: { selected: true, selectedColor: '#60a5fa' }
            }}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#9CA3AF',
              selectedDayBackgroundColor: '#60a5fa',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#60a5fa',
              dayTextColor: '#ffffff',
              textDisabledColor: '#4B5563',
              dotColor: '#60a5fa',
              selectedDotColor: '#ffffff',
              arrowColor: '#60a5fa',
              monthTextColor: '#ffffff',
              indicatorColor: '#60a5fa',
              textDayFontFamily: 'Cinzel',
              textMonthFontFamily: 'Cinzel',
              textDayHeaderFontFamily: 'Cinzel',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1} 
        onPress={() => {
          if (currentView !== 'main') {
            setCurrentView('main');
          } else {
            onClose();
          }
        }}
      >
        <TouchableOpacity 
          style={[styles.modalContent, { transform: [{ translateY: visible ? 0 : 100 }] }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
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
              </>
            )}
          </View>

          {currentView === 'main' && renderMainView()}
          {currentView === 'calendar' && renderCalendarView()}
          {currentView === 'time' && renderTimeView()}
          {currentView === 'datePicker' && renderDatePicker()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 12,
    maxHeight: '85%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 48,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Cinzel-Regular',
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
    fontFamily: 'Cinzel-Regular',
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
  selectedOptionButton: {
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
  selectedOptionText: {
    color: "#000",
    fontWeight: "500",
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
    paddingTop: 15,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
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
  selectedDayButton: {
    backgroundColor: "#333",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    fontFamily: 'Cinzel-Regular',
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
    textAlign: 'left',
    paddingLeft: 8,
    fontFamily: 'Cinzel-Regular',
  },
  pastDayButton: {
    opacity: 0.8,
  },
  pastDayText: {
    color: '#999999',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 250,
    marginTop: -8,
    position: 'relative',
    marginLeft: -20,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectedItemOverlay: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 60,
  },
  pickerContentContainer: {
    paddingHorizontal: 10,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 4,
  },
  selectedPickerItem: {
    backgroundColor: 'transparent',
  },
  pickerItemText: {
    fontSize: 24,
    color: '#CCCCCC',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    fontFamily: 'Cinzel-Regular',
  },
  selectedPickerItemText: {
    color: '#000000',
    fontWeight: '500',
  },
  pickerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  pickerGradientTop: {
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pickerGradientBottom: {
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  anyTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  timeViewContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  bottomSpacing: {
    height: 80,
  },
  saveButton: {
    backgroundColor: '#000000',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cinzel-Regular',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 250,
    marginTop: -8,
    position: 'relative',
    marginLeft: -20,
  },
  simpleDateOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  simpleDateOption: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#f5f5f5',
  },
  simpleDateText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Cinzel-Regular',
  },
  selectedText: {
    color: '#000',
    fontWeight: '500',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default DateTimeBottomSheet; 