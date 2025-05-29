import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const TimePickerScreen = ({ onClose, onSave }) => {
  const [anyTimeEnabled, setAnyTimeEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const periodScrollRef = useRef(null);

  const handleSave = () => {
    if (anyTimeEnabled) {
      onSave('Any time');
    } else {
      const formattedTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
      onSave(formattedTime);
    }
    onClose();
  };

  const renderPickerItems = (items, selectedValue, onSelect, scrollRef) => {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.pickerColumn}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEnabled={!anyTimeEnabled}
      >
        <View style={{ height: PICKER_HEIGHT / 2 }} />
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.pickerItem,
              selectedValue.toString() === item.toString() && styles.selectedPickerItem,
            ]}
            onPress={() => onSelect(item)}
            disabled={anyTimeEnabled}
          >
            <Text
              style={[
                styles.pickerItemText,
                selectedValue.toString() === item.toString() && styles.selectedPickerItemText,
                anyTimeEnabled && styles.disabledText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: PICKER_HEIGHT / 2 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="x" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Time</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.anyTimeContainer}>
        <Text style={styles.anyTimeText}>Any time</Text>
        <Switch
          value={anyTimeEnabled}
          onValueChange={setAnyTimeEnabled}
          trackColor={{ false: '#E5E5E5', true: '#4CAF50' }}
          thumbColor={'#FFFFFF'}
        />
      </View>

      <View style={[styles.pickerContainer, anyTimeEnabled && styles.disabledPicker]}>
        <View style={styles.pickerOverlay}>
          <View style={styles.selectedItemOverlay} />
        </View>
        {renderPickerItems(hours, selectedHour, setSelectedHour, hourScrollRef)}
        {renderPickerItems(minutes, selectedMinute, setSelectedMinute, minuteScrollRef)}
        {renderPickerItems(periods, selectedPeriod, setSelectedPeriod, periodScrollRef)}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
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
  anyTimeText: {
    fontSize: 16,
    color: '#666',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: PICKER_HEIGHT,
    marginTop: 32,
    position: 'relative',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  selectedItemOverlay: {
    height: ITEM_HEIGHT,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 80,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: 'transparent',
  },
  pickerItemText: {
    fontSize: 24,
    color: '#999',
  },
  selectedPickerItemText: {
    color: '#000',
    fontWeight: '500',
  },
  disabledText: {
    color: '#ccc',
  },
  disabledPicker: {
    opacity: 0.5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
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
  },
});

export default TimePickerScreen; 