"use client"

import React from 'react'
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, ScrollView, Image, Alert, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useAuth } from '../contexts/AuthContext'
import RadarChart from '../components/common/RadarChart'
import { Icons } from '../components/Icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

const { width, height } = Dimensions.get("window")

type RootStackParamList = {
  Menu: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BabyWobblesProfile() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<"about" | "personality">("about")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const personalityTraits = [
    { emoji: "", style: { top: 20, left: width * 0.5 - 25 } },
    { emoji: "", style: { top: 60, right: 30 } },
    { emoji: "🧐", style: { top: 140, right: 30 } },
    { emoji: "🤠", style: { bottom: 20, left: width * 0.5 - 25 } },
    { emoji: "😍", style: { top: 140, left: 30 } },
    { emoji: "😌", style: { top: 60, left: 30 } },
  ]

  const handleImagePick = async (type: 'camera' | 'library') => {
    try {
      const permission = type === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Choose Profile Picture",
      "Select an option",
      [
        {
          text: "Take Photo",
          onPress: () => handleImagePick('camera')
        },
        {
          text: "Choose from Library",
          onPress: () => handleImagePick('library')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={[styles.progressDot, { backgroundColor: i < 7 ? "#FCD34D" : "#6B7280" }]} />
        ))}
        <Ionicons name="eye-outline" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
      </View>
    )
  }

  const renderPersonalityChart = () => {
    const personalityData = {
      labels: ['HAPPY', 'PLAYFUL', 'CURIOUS', 'ADVENTUROUS', 'LOVING', 'CALM'],
      datasets: [
        {
          data: [8, 7, 9, 6, 8, 7], // Example values, you can adjust these
        },
      ],
    };

    return (
      <View style={styles.personalityContainer}>
        <ScrollView 
          style={styles.personalityScrollView}
          contentContainerStyle={styles.personalityScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RadarChart 
            data={personalityData} 
            size={(width - 40) / 1.2}
            color="#7DD3FC"
          />
          <View style={styles.scrollSpace} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        {Platform.OS === 'android' ? (
          <TouchableOpacity 
            style={[
              styles.iconButton,
              { marginTop: -0.2, marginLeft: -0.2 }
            ]}
            onPress={() => navigation.navigate('Menu')}
          >
            <Icons name="menu" size={34} color="#60a5fa" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[
                styles.iconButton,
                Platform.OS === 'ios' && { marginLeft: 0.5, marginTop: 0 }
              ]}
              onPress={() => navigation.navigate('Menu')}
            >
              <Icons name="menu" size={34} color="#60a5fa" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  Platform.OS === 'ios' && { marginTop: 0.5 }
                ]}
              >
                <Ionicons name="share-outline" size={34} color="#60a5fa" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  Platform.OS === 'ios' && { marginTop: 0.5 }
                ]}
              >
                <Ionicons name="create-outline" size={34} color="#60a5fa" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <ScrollView 
        style={[
          styles.scrollView,
          Platform.OS === 'android' && { marginTop: 35 }
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? 100 : 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Card Tab */}
          <View style={styles.cardTabContainer}>
            <View style={styles.cardTab}>
              <View style={styles.cardTabHighlight} />
            </View>
          </View>

          <View style={styles.cardContent}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={showImagePickerOptions}>
                <View style={styles.avatar}>
                    {profileImage ? (
                      <Image 
                        source={{ uri: profileImage }} 
                        style={styles.profileImage}
                      />
                    ) : (
                      <Ionicons name="person" size={58} color="#60A5FA" />
                    )}
                </View>
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
              </View>
            </View>

            {activeTab === "about" && (
              <View style={styles.aboutContent}>
                {/* Profile Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>AGE</Text>
                    <Text style={styles.detailValue}>14 days</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>FRIENDSHIP</Text>
                    <View style={styles.friendshipRow}>
                      <Text style={styles.detailValue}>Pals</Text>
                      <Ionicons name="heart" size={16} color="#9CA3AF" />
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>HUMAN</Text>
                    <Text style={[styles.detailValue, styles.unknownText]}>Unknown</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>FRIEND CODE</Text>
                    {renderProgressDots()}
                  </View>
                </View>
              </View>
            )}

            {activeTab === "personality" && renderPersonalityChart()}

            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "about" && styles.activeTab]}
                onPress={() => setActiveTab("about")}
              >
                <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>ABOUT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "personality" && styles.activeTab]}
                onPress={() => setActiveTab("personality")}
              >
                <Text style={[styles.tabText, activeTab === "personality" && styles.activeTabText]}>PERSONALITY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Streak Badge */}
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakLeft}>
              <View style={styles.streakIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#EAB308" />
              </View>
              <View>
                <Text style={styles.streakTitle}>2 day streak</Text>
                <Text style={styles.streakSubtitle}>Longest: 4 days</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingBottom: Platform.OS === 'android' ? 80 : 90,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 5,
    marginBottom: 5,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 12,
    paddingLeft: 0,
    marginTop: Platform.OS === 'ios' ? -20 : -50,
    marginLeft: Platform.OS === 'android' ? -15 : Platform.OS === 'ios' ? -16 : 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    marginRight: Platform.OS === 'android' ? -35 : Platform.OS === 'ios' ? -30 : 0,
  },
  profileCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    marginBottom: 24,
    marginTop: 40,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    width: width < 768 ? "100%" : "75%",
    alignSelf: "center",
    paddingTop: 8,
  },
  cardTabContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  cardTab: {
    backgroundColor: "#7DD3FC",
    height: 39,
    width: 75,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cardTabHighlight: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardContent: {
    padding: 12,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
    marginTop: 0,
  },
  avatar: {
    width: 123,
    height: 140,
    backgroundColor: "#BAE6FD",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  aboutContent: {
    marginBottom: 12,
  },
  detailsGrid: {
    marginBottom: 8,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  unknownText: {
    color: "#9CA3AF",
  },
  friendshipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },
  wingIcon: {
    fontSize: 16,
  },
  personalityContainer: {
    height: 320,
    position: "relative",
  },
  personalityScrollView: {
    flex: 1,
  },
  personalityScrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 30,
  },
  hexagonContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  hexagon: {
    position: "absolute",
    width: 140,
    height: 140,
    backgroundColor: "#E0F2FE",
    transform: [{ rotate: "30deg" }],
  },
  hexagonRotated: {
    transform: [{ rotate: "90deg" }],
  },
  centerCircle: {
    width: 64,
    height: 64,
    backgroundColor: "#7DD3FC",
    borderRadius: 32,
    position: "absolute",
  },
  traitEmoji: {
    position: "absolute",
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emojiText: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#BAE6FD",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1F2937",
  },
  streakCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  streakLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#E0F2FE",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7DD3FC",
  },
  streakSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  personalityDetails: {
    paddingHorizontal: 16,
  },
  personalityDetailItem: {
    marginBottom: 20,
  },
  personalityDetailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
    letterSpacing: 1,
    marginBottom: 4,
  },
  personalityDetailValue: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  scrollSpace: {
    height: 100,
  },
}) 