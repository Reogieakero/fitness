import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, 
  Dimensions, TouchableOpacity, ActivityIndicator,
  Modal, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Trophy, Flame, Zap, 
  Beef, Wheat, Droplets, Award,
  RefreshCcw, X, Info, CheckCircle2
} from 'lucide-react-native';

import { 
  getAllWorkouts, 
  getMealsForToday, 
  getTodaysCompletedQuests,
  getWorkoutStreak,
  getUserStats,
  getWeeklyWorkoutDistribution,
  getTotalQuestCount,
  getDetailedQuestHistory
} from '../database/database';

const { height } = Dimensions.get('window');

const QUEST_TITLES = {
  'q1': "Drink 2L of water",
  'q2': "Morning Stretch",
  'q3': "Log Breakfast",
  't1': "Walk 5,000 steps",
  't2': "No Sugary Drinks",
  't3': "10 Pushups",
  'd1': "Complete HIIT Session",
  'd2': "Log Weight",
  'd3': "Drink 8 glasses of water"
};

// --- GRAPHICAL COMPONENTS ---

const BarChart = ({ data, title, color }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.barRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barBg}>
              <View 
                style={[
                  styles.barFill, 
                  { height: `${(item.value / maxVal) * 100}%`, backgroundColor: color }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const ProgressRing = ({ value, total, label, color, icon: Icon }) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <View style={styles.ringWrapper}>
      <View style={[styles.ringOuter, { borderColor: '#F1F5F9' }]}>
        <View style={styles.ringContent}>
          <Icon color={color} size={18} />
          <Text style={styles.ringValue}>{Math.round(percentage)}%</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
};

// --- MAIN SCREEN ---

export default function StatsScreen({ userId }) {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [questModalVisible, setQuestModalVisible] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [questHistory, setQuestHistory] = useState([]);
  
  const [stats, setStats] = useState({
    workoutCount: 0,
    streak: 0,
    xp: 0,
    level: 1,
    macros: { p: 0, c: 0, f: 0 },
    questsDone: 0,
    totalQuests: 0,
    workoutHistory: []
  });

  const loadAllStats = useCallback(() => {
    setLoading(true);
    try {
      const workouts = getAllWorkouts(userId) || [];
      const streak = getWorkoutStreak(userId) || 0;
      const meals = getMealsForToday(userId) || [];
      const questsToday = getTodaysCompletedQuests(userId) || [];
      const user = getUserStats(userId) || {};
      const weeklyDist = getWeeklyWorkoutDistribution(userId) || [];
      const totalQuests = getTotalQuestCount(userId) || 0;
      const history = getDetailedQuestHistory(userId) || [];

      const todayMacros = meals.reduce((acc, m) => ({
        p: acc.p + (Number(m.protein) || 0),
        c: acc.c + (Number(m.carbs) || 0),
        f: acc.f + (Number(m.fat) || 0)
      }), { p: 0, c: 0, f: 0 });

      setQuestHistory(history);
      setStats({
        workoutCount: workouts.length,
        streak,
        xp: user.xp || 0,
        level: user.level || 1,
        macros: todayMacros,
        questsDone: questsToday.length,
        totalQuests: totalQuests,
        workoutHistory: weeklyDist
      });
    } catch (e) {
      console.error("Stats Load Error:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  const openModal = (type) => {
    let data = {};
    switch(type) {
      case 'streak':
        data = { title: 'Consistency Streak', description: 'Your current daily workout streak.', value: stats.streak, unit: 'Days', color: '#EF4444' };
        break;
      case 'rank':
        data = { title: 'Hero Rank', description: 'Your current experience level based on training.', value: stats.level, unit: 'Level', color: '#F59E0B' };
        break;
      case 'workouts':
        data = { title: 'Mission History', description: 'Total number of sessions recorded.', value: stats.workoutCount, unit: 'Workouts', color: '#6366F1' };
        break;
      case 'nutrition':
        data = { title: 'Macro Breakdown', description: 'Today\'s protein, carb, and fat intake progress.', value: `${stats.macros.p}g P`, unit: 'Current', color: '#3B82F6' };
        break;
    }
    setSelectedStat(data);
    setModalVisible(true);
  };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#1E3A8A" /></View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Detail Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <X color="#64748B" size={24} />
            </TouchableOpacity>
            {selectedStat && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIconCircle, { backgroundColor: selectedStat.color + '20' }]}>
                  <Info color={selectedStat.color} size={32} />
                </View>
                <Text style={styles.modalTitle}>{selectedStat.title}</Text>
                <Text style={styles.modalDesc}>{selectedStat.description}</Text>
                <View style={styles.modalStatCard}>
                  <Text style={[styles.modalStatValue, { color: selectedStat.color }]}>{selectedStat.value}</Text>
                  <Text style={styles.modalStatUnit}>{selectedStat.unit}</Text>
                </View>
                <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: selectedStat.color }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalActionText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Quest History Modal */}
      <Modal animationType="fade" transparent={true} visible={questModalVisible} onRequestClose={() => setQuestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quest Log</Text>
              <TouchableOpacity onPress={() => setQuestModalVisible(false)}><X color="#64748B" size={24} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {questHistory.length === 0 ? (
                <Text style={styles.emptyText}>No quests completed yet.</Text>
              ) : (
                questHistory.map((quest, index) => {
                  // FIX: If questId is somehow an object (which causes your error), 
                  // we convert it to a string or grab a property to prevent crashing.
                  const qId = typeof quest.questId === 'object' ? quest.questId.name : quest.questId;
                  
                  return (
                    <View key={index} style={styles.questHistoryItem}>
                      <View style={styles.historyIconBox}><CheckCircle2 color="#10B981" size={20} /></View>
                      <View>
                        <Text style={styles.historyQuestId}>{QUEST_TITLES[qId] || qId || "Unknown Quest"}</Text>
                        <Text style={styles.historyDate}>{quest.completionDate}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>PERFORMANCE HUB</Text>
          <Text style={styles.headerTitle}>Hero Stats</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadAllStats}>
          <RefreshCcw color="#1E3A8A" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <TouchableOpacity style={[styles.cardBase, styles.heroCard]} onPress={() => openModal('streak')}>
            <Flame color="#EF4444" fill="#EF4444" size={22} />
            <Text style={styles.heroValue}>{stats.streak}</Text>
            <Text style={styles.heroLabel}>Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardBase, styles.heroCard]} onPress={() => openModal('rank')}>
            <Trophy color="#F59E0B" fill="#F59E0B" size={22} />
            <Text style={styles.heroValue}>Lv. {stats.level}</Text>
            <Text style={styles.heroLabel}>Rank</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardBase, styles.heroCard]} onPress={() => openModal('workouts')}>
            <Zap color="#6366F1" fill="#6366F120" size={22} />
            <Text style={styles.heroValue}>{stats.workoutCount}</Text>
            <Text style={styles.heroLabel}>Workouts</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={[styles.cardBase, styles.chartCard]}>
          <BarChart title="Weekly Mission Activity" data={stats.workoutHistory} color="#1E3A8A" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Metabolic Balance</Text>
          <Text style={styles.sectionSub}>Today's Progress</Text>
        </View>
        
        <TouchableOpacity onPress={() => openModal('nutrition')} style={[styles.cardBase, styles.macroRings]}>
          <ProgressRing label="Protein" value={stats.macros.p} total={160} color="#EF4444" icon={Beef} />
          <ProgressRing label="Carbs" value={stats.macros.c} total={250} color="#F59E0B" icon={Wheat} />
          <ProgressRing label="Fats" value={stats.macros.f} total={70} color="#3B82F6" icon={Droplets} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cardBase, styles.achievementCard]} onPress={() => setQuestModalVisible(true)}>
          <View style={styles.achieveHeader}>
            <Award color="#10B981" size={24} />
            <Text style={styles.achieveTitle}>Daily Quests</Text>
          </View>
          <View style={styles.questProgressContainer}>
            <View style={styles.questRow}>
              <Text style={styles.questStatText}>{stats.questsDone} / 3 Complete</Text>
              <Text style={styles.questPercentText}>{Math.round((stats.questsDone/3)*100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(stats.questsDone/3)*100}%` }]} />
            </View>
          </View>
          <View style={styles.lifetimeBox}>
            <Text style={styles.lifetimeText}>Lifetime Quests Completed: {stats.totalQuests}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardBase: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    }),
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  refreshBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  scrollContent: { paddingHorizontal: 20 },
  heroRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  heroCard: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  heroValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 8 },
  heroLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginTop: 2 },
  chartCard: { padding: 20, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  barRow: { flexDirection: 'row', height: 120, alignItems: 'flex-end', justifyContent: 'space-between' },
  barColumn: { alignItems: 'center', flex: 1 },
  barBg: { width: 10, height: '100%', backgroundColor: '#F1F5F9', borderRadius: 5, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 5 },
  barLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 8 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  sectionSub: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  macroRings: { flexDirection: 'row', padding: 20, justifyContent: 'space-around', marginBottom: 20 },
  ringWrapper: { alignItems: 'center' },
  ringOuter: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  ringContent: { alignItems: 'center' },
  ringValue: { fontSize: 11, fontWeight: '900', color: '#0F172A' },
  ringLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 10 },
  achievementCard: { padding: 20, marginBottom: 20 },
  achieveHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  achieveTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  questProgressContainer: { marginTop: 5 },
  questRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  questStatText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  questPercentText: { fontSize: 14, fontWeight: '800', color: '#10B981' },
  progressBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 5 },
  lifetimeBox: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  lifetimeText: { fontSize: 12, fontWeight: '600', color: '#64748B', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: height * 0.4 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  modalBody: { alignItems: 'center', marginTop: 10 },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  modalDesc: { fontSize: 16, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  modalStatCard: { backgroundColor: '#F8FAFC', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 20, marginTop: 25, alignItems: 'center', width: '100%' },
  modalStatValue: { fontSize: 42, fontWeight: '900' },
  modalStatUnit: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },
  modalActionBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  modalActionText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  questHistoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  historyIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyQuestId: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  historyDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20, fontSize: 14 }
});