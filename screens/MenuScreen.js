import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icons } from '../components/Icons';
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import StartScreenn from './StartScreenn';
import * as Haptics from 'expo-haptics';

export default function MenuScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000', '#000000']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7} 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }}
        >
          <AntDesign name="back" size={34} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuScrollView} contentContainerStyle={styles.menuContentContainer}>
        {/* Main menu grid */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            {/* Self-Care Areas */}
            <TouchableOpacity 
              style={styles.gridCard} 
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('SelfCareArea'); }}
            >
              <View style={styles.selfCareIconContainer}>
                <View style={styles.selfCareRow}>
                  <View style={[styles.colorDot, { backgroundColor: "#F97316" }]} />
                  <View style={[styles.colorDot, { backgroundColor: "#60A5FA" }]} />
                </View>
                <View style={styles.selfCareRow}>
                  <View style={[styles.colorDot, { backgroundColor: "#A78BFA" }]} />
                  <View style={[styles.colorDot, { backgroundColor: "#FBBF24" }]} />
                </View>
              </View>
              <Text style={styles.gridCardText}>Self-Care Areas</Text>
            </TouchableOpacity>

            {/* My Goals */}
            <TouchableOpacity 
              style={styles.gridCard} 
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('PreGoal'); }}
            >
              <View style={styles.iconContainer}>
                <View style={styles.goalsIconBg}>
                  <View style={styles.goalsIconCheck} />
                </View>
              </View>
              <Text style={styles.gridCardText}>My Goals</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            {/* Insights */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('StartScreenn'); }}
            >
              <View style={styles.iconContainer}>
                <View style={styles.insightsIconBg}>
                  <View style={styles.insightsBarContainer}>
                    <View style={[styles.insightsBar, { height: 16, backgroundColor: "#EF4444" }]} />
                    <View style={[styles.insightsBar, { height: 8, backgroundColor: "#10B981" }]} />
                    <View style={[styles.insightsBar, { height: 20, backgroundColor: "#3B82F6" }]} />
                  </View>
                </View>
              </View>
              <Text style={styles.gridCardText}>Insights</Text>
            </TouchableOpacity>

            {/* Newsletters */}
            <TouchableOpacity style={styles.gridCard} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('OnboardingHistory'); }}>
              <View style={styles.iconContainer}>
                <View style={styles.newslettersIconBg}>
                  <View style={styles.newslettersLineContainer}>
                    <View style={[styles.newslettersLine, { backgroundColor: "#3B82F6" }]} />
                    <View style={[styles.newslettersLine, { backgroundColor: "#D1D5DB" }]} />
                    <View style={[styles.newslettersLine, { backgroundColor: "#D1D5DB" }]} />
                  </View>
                </View>
              </View>
              <Text style={styles.gridCardText}>Newsletters</Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          <TouchableOpacity style={styles.fullWidthCard} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('PreGoal'); }}>
            <View style={styles.iconContainer}>
              <View style={styles.historyIconBg}>
                <View style={styles.historyIconCalendar}>
                  <View style={styles.historyIconLine} />
                  <View style={styles.historyIconLine} />
                </View>
              </View>
            </View>
            <Text style={styles.gridCardText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Submit feedback */}
        <TouchableOpacity style={styles.menuCard} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('NewOnboarding'); }}>
          <View style={styles.menuCardContent}>
            <View style={styles.menuCardLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcon name="star" size={24} color="#FBBF24" />
              </View>
              <View style={styles.menuCardTextContainer}>
                <Text style={styles.menuCardSubtitle}>SELF-CARE AREAS</Text>
                <Text style={styles.menuCardTitle}>Submit your feedback</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.sectionCard}>
          {/* Notifications */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Icon name="bell" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Profile */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.profileIconBg}>
                <Text style={styles.profileIconText}>:)</Text>
              </View>
              <Text style={styles.menuItemText}>Profile</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Preferences */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcon name="view-grid" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.menuItemText}>Preferences</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Your data */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcon name="file-document" size={22} color="#A78BFA" />
              </View>
              <Text style={styles.menuItemText}>Your data</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <View style={styles.sectionCard}>
          {/* Help center */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.helpIconBg}>
                <Icon name="help-circle" size={22} color="#60A5FA" />
              </View>
              <Text style={styles.menuItemText}>Help center</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* About */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.aboutIconBg}>
                <MaterialIcon name="file-document-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.menuItemText}>About</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Report issue */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* existing action */ }}>
            <View style={styles.menuItemLeft}>
              <View style={styles.reportIconBg}>
                <MaterialIcon name="message-outline" size={20} color="#F87171" />
              </View>
              <Text style={styles.menuItemText}>Report issue</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          activeOpacity={0.7}
          onPress={async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }}
        >
          <View style={styles.logoutIconBg}>
            <MaterialIcon name="logout" size={20} color="#EF4444" />
          </View>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.versionText}>Riz Up v1 (2025)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 35 : 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -5,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  menuScrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 100 : 115,
  },
  menuContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridCard: {
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  fullWidthCard: {
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  gridCardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginLeft: 12,
    fontFamily: 'Cinzel',
  },
  selfCareIconContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  selfCareRow: {
    flexDirection: "row",
    marginVertical: -4,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: -2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  goalsIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  goalsIconCheck: {
    width: 12,
    height: 12,
    backgroundColor: "#10B981",
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  insightsIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  insightsBarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 20,
  },
  insightsBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  newslettersIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  newslettersLineContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  newslettersLine: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginVertical: 1,
  },
  historyIconBg: {
    width: 24,
    height: 24,
    backgroundColor: "#FEE2E2",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  historyIconCalendar: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#F87171",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  historyIconLine: {
    width: 12,
    height: 2,
    backgroundColor: "#60A5FA",
    marginVertical: 1,
    borderRadius: 1,
  },
  menuCard: {
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  menuCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuCardTextContainer: {
    marginLeft: 12,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    fontFamily: 'Cinzel',
  },
  menuCardSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontFamily: 'Cinzel',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    fontFamily: 'Cinzel',
  },
  sectionCard: {
    backgroundColor: "rgba(26, 26, 26, 0.8)",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginLeft: 12,
    fontFamily: 'Cinzel',
  },
  menuItemSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 12,
    fontFamily: 'Cinzel',
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
  },
  inviteIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
  },
  communitiesIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#EDE9FE",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  communitiesIconDot: {
    width: 16,
    height: 16,
    backgroundColor: "#C4B5FD",
    borderRadius: 8,
  },
  rainbowBar: {
    width: 24,
    height: 12,
    borderRadius: 6,
  },
  profileIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    fontSize: 14,
    color: "#60A5FA",
    fontFamily: 'Cinzel',
  },
  helpIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#60A5FA",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  aboutIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#D1FAE5",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  reportIconBg: {
    width: 28,
    height: 28,
    backgroundColor: "#FEE2E2",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
  emojiIcon: {
    fontSize: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    marginTop: -10,
    marginBottom: 5,
    marginRight: 10,
  },
  logoutIconBg: {
    width: 28,
    height: 28,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
}); 