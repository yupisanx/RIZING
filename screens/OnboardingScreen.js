import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { setHasCompletedOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Verify Firebase connection on component mount
  useEffect(() => {
    const verifyFirebase = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("No authenticated user found");
          return;
        }
        
        // Test Firestore connection
        const testDoc = await getDoc(doc(db, "users", user.uid));
        console.log("Firebase connection test:", {
          auth: !!user,
          uid: user.uid,
          firestore: !!testDoc
        });
      } catch (error) {
        console.error("Firebase verification error:", error);
      }
    };

    verifyFirebase();
  }, []);

  const selectGoal = async (goal) => {
    if (isLoading) return; // Prevent multiple submissions

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      
      // Verify authentication
      if (!user) {
        console.error("Auth error: No current user");
        Alert.alert("Error", "User not logged in");
        return;
      }

      const uid = user.uid;
      console.log("Current user:", {
        uid,
        email: user.email,
        displayName: user.displayName
      });

      // First check if user document exists
      const userDoc = await getDoc(doc(db, "users", uid));
      console.log("User document status:", {
        exists: userDoc.exists(),
        data: userDoc.data()
      });

      // Prepare the data to save
      const userData = {
        profile: {
          username: user.displayName || "test_user",
          goal: goal,
          created_at: new Date(),
        },
        training: {
          goal: goal,
        },
        stats: {
          level: 1,
          xp: 0,
          coins: 0,
          strength: 1,
          agility: 1,
          stamina: 1,
          intelligence: 1,
          rank: "E",
        },
      };

      console.log("Attempting to save data:", userData);

      // Try to save with merge option
      await setDoc(doc(db, "users", uid), userData, { merge: true });
      console.log("✅ Goal saved successfully to Firestore");

      // Update onboarding status
      setHasCompletedOnboarding(true);
      
      // Small delay before navigation to ensure state is updated
      setTimeout(() => {
        navigation.navigate("MainTabs");
      }, 100);

    } catch (error) {
      console.error("Detailed error saving goal:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      Alert.alert(
        "Error",
        `Failed to save your goal: ${error.message || 'Unknown error'}\nPlease try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Goal</Text>
      {["shred", "strength", "endurance"].map((goal) => (
        <TouchableOpacity 
          key={goal} 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={() => selectGoal(goal)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{goal.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f0f" },
  title: { fontSize: 24, color: "#d8b4fe", marginBottom: 30 },
  button: { 
    padding: 16, 
    backgroundColor: "#1e1e1e", 
    marginVertical: 10, 
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: { color: "#d8b4fe", fontSize: 18 }
}); 