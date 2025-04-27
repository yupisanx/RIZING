import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ExerciseTable = ({ exercises, completedExercises, onExerciseComplete }) => {
  const defaultExercises = [
    { name: 'Back Extensions', total: 45 },
    { name: 'Table Rows', total: 45 },
    { name: 'Superman Pull', total: 45 },
    { name: 'Prone Y-Raise', total: 45 },
    { name: 'Rear Delt Raises', total: 45 }
  ];

  const exercisesToDisplay = exercises || defaultExercises;

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {exercisesToDisplay.map((exercise, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exerciseRow}
            onPress={() => onExerciseComplete(exercise.name)}
          >
            <View style={styles.nameContainer}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.exerciseTotal}>
                {`[${completedExercises[exercise.name] ? exercise.total : 0}/${exercise.total}]`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    width: '100%',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
    paddingHorizontal: 10,
  },
  nameContainer: {
    flex: 1,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'PressStart2P',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseTotal: {
    color: '#3b82f6',
    fontSize: 11,
    fontFamily: 'PressStart2P',
  }
});

export default ExerciseTable; 