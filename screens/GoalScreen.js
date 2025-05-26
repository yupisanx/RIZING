"use client"

import { useState } from "react"
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
} from "react-native"
import Icon from "react-native-vector-icons/Feather"

export default function GoalScreen({ navigation }) {
  const [goalText, setGoalText] = useState("")
  const [showRepeatModal, setShowRepeatModal] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [repeatOption, setRepeatOption] = useState("Does not repeat")
  const [endOption, setEndOption] = useState("Never")

  // Custom frequency options
  const [frequencyType, setFrequencyType] = useState("Daily") // Daily, Weekly, Monthly
  const [frequencyValue, setFrequencyValue] = useState("1 day")
  const [selectedDays, setSelectedDays] = useState([1]) // For monthly
  const [selectedWeekdays, setSelectedWeekdays] = useState(["Mon"]) // For weekly

  const handleSave = () => {
    // Handle saving the goal
    console.log("Goal saved:", {
      goalText,
      repeatOption,
      endOption,
      customFrequency: {
        type: frequencyType,
        value: frequencyValue,
        selectedDays,
        selectedWeekdays,
      },
    })
    alert("Goal saved!")
    navigation.goBack()
  }

  const handleRepeatOptionClick = (option) => {
    if (option === "Custom...") {
      setShowCustomModal(true)
    } else {
      setRepeatOption(option)
      setShowRepeatModal(false)
    }
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
    setShowCustomModal(false)
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

  const renderCustomFrequencyModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCustomModal}
        onRequestClose={() => setShowCustomModal(false)}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, Platform.OS === 'ios' && styles.modalContainerIOS]}>
          <View style={[styles.modalContent, Platform.OS === 'ios' && styles.modalContentIOS]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowCustomModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Repeat</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Frequency Type Tabs */}
            <View style={styles.tabContainer}>
              {["Daily", "Weekly", "Monthly"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.tab, frequencyType === type && styles.activeTab]}
                  onPress={() => {
                    setFrequencyType(type);
                    if (type === "Daily") setFrequencyValue("1 day");
                    if (type === "Weekly") setFrequencyValue("1 week");
                    if (type === "Monthly") setFrequencyValue("1 month");
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.tabText, frequencyType === type && styles.activeTabText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Every X days/weeks/months */}
            <View style={styles.optionContainer}>
              <Text style={styles.optionLabel}>Every</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.dropdownText}>{frequencyValue}</Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Day selection for Weekly */}
            {frequencyType === "Weekly" && (
              <View style={styles.weekdayContainer}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, selectedWeekdays.includes(day) && styles.selectedDayButton]}
                    onPress={() => toggleWeekdaySelection(day)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.dayText, selectedWeekdays.includes(day) && styles.selectedDayText]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Day selection for Monthly */}
            {frequencyType === "Monthly" && (
              <ScrollView style={styles.monthDayScrollView}>
                <View style={styles.monthDayContainer}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDayButton]}
                      onPress={() => toggleDaySelection(day)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.dayText, selectedDays.includes(day) && styles.selectedDayText]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* End date */}
            <View style={styles.optionContainer}>
              <Text style={styles.optionLabel}>Ends</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.dropdownText}>{endOption}</Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Save button */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleCustomSave}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderRepeatModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRepeatModal}
        onRequestClose={() => setShowRepeatModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
              <View style={styles.optionItem}>
                <Text style={styles.optionText}>Does not repeat</Text>
                {repeatOption === "Does not repeat" && (
                  <View style={styles.checkmark}>
                    <Icon name="check" size={20} color="#fff" />
                  </View>
                )}
              </View>

              <View style={styles.optionItem}>
                <Text style={styles.optionText}>Ends</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.dropdownText}>{endOption}</Text>
                  <Icon name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {["Every day", "Every weekday", "Every week on Mon", "Every month on the 12th", "Custom..."].map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.optionButton}
                      onPress={() => handleRepeatOptionClick(option)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.optionButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
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
          >
            <View style={styles.optionIcon}>
              <Icon name="plus" size={20} color="#000" />
            </View>
            <Text style={styles.optionText}>Add to an area</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.optionIcon}>
              <Icon name="calendar" size={20} color="#000" />
            </View>
            <Text style={styles.optionText}>Today</Text>
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
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderRepeatModal()}
      {renderCustomFrequencyModal()}
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
    margin: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
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
  },
  input: {
    fontSize: 16,
    marginBottom: 20,
    padding: 0,
  },
  optionsContainer: {
    marginBottom: 20,
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
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  moreOptionsText: {
    color: "#666",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
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
    marginRight: 4,
  },
  optionsList: {
    marginTop: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionButtonText: {
    color: "#666",
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    color: "#999",
    fontSize: 16,
  },
  activeTabText: {
    color: "#000",
    fontWeight: "500",
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
  },
  weekdayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
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
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
  },
  selectedDayButton: {
    backgroundColor: "#000",
  },
  dayText: {
    color: "#666",
  },
  selectedDayText: {
    color: "#fff",
  },
  saveButtonContainer: {
    alignItems: "flex-end",
    marginTop: 16,
  },
}) 