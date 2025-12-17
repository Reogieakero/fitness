import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Modal, Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, Flame, Trophy, 
  ChevronRight, Award, Activity, X,
  CheckCircle2
} from 'lucide-react-native';

// DATABASE IMPORTS
import { 
  updateUserStatsInDB, 
  saveQuestCompletion, 
  getTodaysCompletedQuests 
} from '../database/database';

// Move StatBox here so it's defined before use
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

export default function Home({ user: initialUser }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [quests, setQuests] = useState([]);

  // FETCH PERSISTED QUESTS ON LOAD
  useEffect(() => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const questPool = {
      Monday: [
        { id: 'q1', title: "Drink 2L of water", xp: 20 },
        { id: 'q2', title: "Morning Stretch", xp: 15 },
        { id: 'q3', title: "Log Breakfast", xp: 15 }
      ],
      Tuesday: [
        { id: 't1', title: "Walk 5,000 steps", xp: 25 },
        { id: 't2', title: "No Sugary Drinks", xp: 15 },
        { id: 't3', title: "10 Pushups", xp: 10 }
      ],
      default: [
        { id: 'd1', title: "Complete HIIT Session", xp: 30 },
        { id: 'd2', title: "Log Weight", xp: 10 },
        { id: 'd3', title: "Drink 8 glasses of water", xp: 10 }
      ]
    };

    const dailyPool = questPool[todayName] || questPool.default;

    // Get completed IDs for THIS user for TODAY from SQLite
    const completedIds = getTodaysCompletedQuests(user.id);

    // Sync state
    const syncedQuests = dailyPool.map(q => ({
      ...q,
      completed: completedIds.includes(q.id)
    }));

    setQuests(syncedQuests);
  }, [user.id]);

  const currentXp = user?.xp || 0;
  const maxXp = 100;
  const progressPercent = Math.min((currentXp / maxXp) * 100, 100);

  const handleQuestToggle = (questId, questXp) => {
    const isAlreadyDone = quests.find(q => q.id === questId)?.completed;
    if (isAlreadyDone) return;

    let newXp = currentXp + questXp;
    let newLevel = user.level || 1;

    if (newXp >= maxXp) {
      newLevel += 1;
      newXp = newXp - maxXp;
    }

    updateUserStatsInDB(user.id, newXp, newLevel);
    saveQuestCompletion(user.id, questId);

    setUser(prev => ({ ...prev, xp: newXp, level: newLevel }));
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
  };

  const allBadges = [
    { id: 1, title: 'Welcome Hero', desc: 'Successfully created an account', earned: true, color: '#10B981' },
    { id: 2, title: 'Early Bird', desc: 'Workout before 8 AM', earned: user?.workoutsToday > 0, color: '#F59E0B' },
    { id: 3, title: 'Streak Master', desc: '7 days in a row', earned: user?.streak >= 7, color: '#6366F1' },
    { id: 4, title: 'Calorie Crusher', desc: 'Burn 500kcal in one go', earned: user?.caloriesLogged >= 500, color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Afternoon,</Text>
            <Text style={styles.userName}>{user.firstName}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame color="#F97316" size={18} fill="#F97316" />
            <Text style={styles.streakText}>{user?.streak || 0}</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelSub}>RANK</Text>
              <Text style={styles.levelTitle}>{user.level < 5 ? 'Novice Hero' : 'Rising Star'}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>LVL {user.level}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
               <Text style={styles.progressText}>{currentXp} / {maxXp} XP</Text>
               <Text style={styles.progressText}>Next: Level {user.level + 1}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatBox icon={<Target color="#1E40AF" size={18} />} value={user?.workoutsToday || "0"} label="Workouts" sub="Today" />
          <StatBox icon={<Activity color="#059669" size={18} />} value={user?.caloriesLogged || "0"} label="Calories" sub="Burned" />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAchievements(true)}>
            <StatBox icon={<Trophy color="#D97706" size={18} />} value={user?.achievementsCount || "1"} label="Badges" sub="Earned" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Quests</Text>
          <View style={styles.xpBonusContainer}><Text style={styles.xpBonusText}>Earn XP</Text></View>
        </View>
        
        <View style={styles.questCard}>
          {quests.map((quest) => (
            <TouchableOpacity 
              key={quest.id} 
              style={styles.questItem} 
              onPress={() => handleQuestToggle(quest.id, quest.xp)}
              disabled={quest.completed}
            >
              <CheckCircle2 
                color={quest.completed ? '#10B981' : '#E2E8F0'} 
                size={22} 
                fill={quest.completed ? '#10B98120' : 'transparent'} 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.questText, quest.completed && styles.questTextDone]}>
                  {quest.title}
                </Text>
              </View>
              {!quest.completed && <Text style={styles.questXpTag}>+{quest.xp} XP</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.achievementCard} onPress={() => setShowAchievements(true)}>
          <View style={styles.achievementIconBox}><Award color="#F59E0B" size={24} /></View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Welcome {user.firstName}</Text>
            <Text style={styles.achievementSub}>Successfully earned: Account Badge</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </ScrollView>

      {/* Modal remains unchanged... */}
      <Modal visible={showAchievements} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Badges</Text>
              <TouchableOpacity onPress={() => setShowAchievements(false)}><X color="#0F172A" size={24} /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.badgeList} showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 110 // ADDED: Extra padding so NavBar doesn't cover content
  },
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
  questCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24 },
  questItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  questText: { fontSize: 14, color: '#334155', fontWeight: '700' },
  questTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  questXpTag: { fontSize: 12, fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpBonusContainer: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  xpBonusText: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  achievementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  achievementIconBox: { width: 44, height: 44, backgroundColor: '#FEF3C7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementInfo: { flex: 1, marginLeft: 12 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  achievementSub: { fontSize: 12, color: '#64748B' },
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
  closeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});