import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../components/Icons';

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#0284c7', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Icons name="bell" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Icons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.trainingCard}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: '#ffffff' }]} />
          <View style={[styles.dot, { backgroundColor: '#6b7280' }]} />
          <View style={[styles.dot, { backgroundColor: '#6b7280' }]} />
          <View style={[styles.dot, { backgroundColor: '#6b7280' }]} />
        </View>
        <Text style={styles.cardTitle}>Daily Training</Text>
        <Text style={styles.cardSubtitle}>no quests available</Text>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>-</Text>
        </View>
      </View>

      <View style={styles.questCard}>
        <View style={styles.questHeader}>
          <Icons name="info" size={24} color="#0284c7" />
          <Text style={styles.questTitle}>DAILY QUEST</Text>
        </View>
        <Text style={styles.questInstructions}>
          [Click below to generate your quest.]
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Icons name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  iconButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  trainingCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    position: 'relative',
  },
  dotContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: 16,
  },
  progressCircle: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 18,
  },
  questCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  questTitle: {
    color: '#0284c7',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  questInstructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#0284c7',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 