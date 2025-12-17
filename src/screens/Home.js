import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Modal, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, Flame, Trophy, 
  ChevronRight, Award, Activity, X
} from 'lucide-react-native';

export default function Home({ user }) {
  const [showAchievements, setShowAchievements] = useState(false);

  const firstName = user?.firstName || 'Hero';
  const currentXp = user?.xp || 0;
  const maxXp = 100;
  const progressPercent = Math.min((currentXp / maxXp) * 100, 100);

  // Dynamic Badges: The "Welcome Hero" is earned if the user exists (id > 0)
  const allBadges = [
    { 
      id: 1, 
      title: 'Welcome Hero', 
      desc: 'Successfully created an account', 
      earned: true, // Always true for anyone logged in
      color: '#10B981' 
    },
    { 
      id: 2, 
      title: 'Early Bird', 
      desc: 'Workout before 8 AM', 
      earned: user?.workoutsToday > 0, // Dynamic example
      color: '#F59E0B' 
    },
    { 
      id: 3, 
      title: 'Streak Master', 
      desc: '7 days in a row', 
      earned: user?.streak >= 7, 
      color: '#6366F1' 
    },
    { 
      id: 4, 
      title: 'Calorie Crusher', 
      desc: 'Burn 500kcal in one go', 
      earned: user?.caloriesLogged >= 500, 
      color: '#EF4444' 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Afternoon,</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame color="#F97316" size={18} fill="#F97316" />
            <Text style={styles.streakText}>{user?.streak || 0}</Text>
          </View>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelSub}>RANK</Text>
              <Text style={styles.levelTitle}>{currentXp < 100 ? 'Novice Hero' : 'Rising Star'}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>LVL {user?.level || 1}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
               <Text style={styles.progressText}>{currentXp} / {maxXp} XP</Text>
               <Text style={styles.progressText}>Next: Iron Tier</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox icon={<Target color="#1E40AF" size={18} />} value={user?.workoutsToday || "0"} label="Workouts" sub="Today" />
          <StatBox icon={<Activity color="#059669" size={18} />} value={user?.caloriesLogged || "0"} label="Calories" sub="Burned" />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAchievements(true)}>
            <StatBox icon={<Trophy color="#D97706" size={18} />} value={user?.achievementsCount || "1"} label="Badges" sub="Earned" />
          </TouchableOpacity>
        </View>

        {/* Recent Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity onPress={() => setShowAchievements(true)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.achievementCard} onPress={() => setShowAchievements(true)}>
          <View style={styles.achievementIconBox}>
            <Award color="#F59E0B" size={24} />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Welcome {firstName}</Text>
            <Text style={styles.achievementSub}>Successfully earned: Account Badge</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"The only bad workout is the one that didn't happen"</Text>
        </View>
      </ScrollView>

      {/* --- ACHIEVEMENTS MODAL --- */}
      <Modal visible={showAchievements} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Badges</Text>
              <TouchableOpacity onPress={() => setShowAchievements(false)}>
                <X color="#0F172A" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.badgeList}>
              {allBadges.map((badge) => (
                <View key={badge.id} style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: badge.earned ? badge.color + '20' : '#F1F5F9' }]}>
                    <Award color={badge.earned ? badge.color : '#94A3B8'} size={28} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.badgeName, !badge.earned && { color: '#94A3B8' }]}>{badge.title}</Text>
                    <Text style={styles.badgeDesc}>{badge.desc}</Text>
                  </View>
                  {badge.earned && <Trophy color="#F59E0B" size={16} />}
                </View>
              ))}
            </ScrollView>

            <Pressable style={styles.closeBtn} onPress={() => setShowAchievements(false)}>
              <Text style={styles.closeBtnText}>Back to Profile</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatBox = ({ icon, value, label, sub }) => (
  <View style={styles.statBox}>
    <View style={styles.statTopRow}>
      <View style={styles.statIconWrapper}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <View style={styles.statTextWrapper}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubLabel}>{sub}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  streakText: { marginLeft: 6, fontWeight: '800', fontSize: 16, color: '#0F172A' },
  levelCard: { backgroundColor: '#1E3A8A', borderRadius: 24, padding: 24, marginBottom: 16 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800' },
  levelTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  xpBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  progressContainer: { marginTop: 20 },
  progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#60A5FA', borderRadius: 3 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 100 },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statIconWrapper: { padding: 6, borderRadius: 10, backgroundColor: '#F1F5F9' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  statTextWrapper: { marginTop: 'auto' },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  statSubLabel: { fontSize: 10, fontWeight: '500', color: '#94A3B8' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  viewAll: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  achievementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  achievementIconBox: { width: 44, height: 44, backgroundColor: '#FEF3C7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementInfo: { flex: 1, marginLeft: 12 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  achievementSub: { fontSize: 12, color: '#64748B' },
  quoteCard: { marginTop: 24, backgroundColor: '#0F172A', padding: 20, borderRadius: 20, alignItems: 'center' },
  quoteText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  badgeList: { gap: 16, paddingBottom: 20 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  badgeLocked: { opacity: 0.6 },
  badgeIconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  badgeName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  badgeDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  closeBtn: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  closeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});