import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Modal, Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, Flame, Trophy, 
  ChevronRight, Award, Activity, X,
  CheckCircle2, Quote as QuoteIcon,
  Zap, Dumbbell, Timer
} from 'lucide-react-native';

import { 
  updateUserStatsInDB, 
  saveQuestCompletion, 
  getTodaysCompletedQuests,
  getWorkoutsForToday,
  logWorkout
} from '../database/database';

const StatBox = ({ icon, value, label, sub, onPress, style }) => (
  <TouchableOpacity 
    style={[styles.cardBase, styles.statBox, style]} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.statTopRow}>
      <View style={styles.statIconWrapper}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <View style={styles.statTextWrapper}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubLabel}>{sub}</Text>
    </View>
  </TouchableOpacity>
);

export default function Home({ user: initialUser, onWorkoutStart }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [user, setUser] = useState(initialUser);
  const [quests, setQuests] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });
  const [todayWorkouts, setTodayWorkouts] = useState([]);

  const intensities = [
    { id: 'Low', title: 'Light', desc: 'Focus on mobility and steady movement.', color: '#10B981', xp: 15 },
    { id: 'Medium', title: 'Moderate', desc: 'Balanced cardio and strength routine.', color: '#6366F1', xp: 30 },
    { id: 'High', title: 'Intense', desc: 'High-energy HIIT and heavy lifting.', color: '#EF4444', xp: 50 },
  ];

  const exercisePool = {
    Low: ["Walking (5 mins)"],
    Medium: ["Bodyweight Squats", "Standard Pushups", "Plank (60s)", "Lunges", "Mountain Climbers", "Jumping Jacks", "Dumbbell Press", "Bicep Curls", "Bicycle Crunches", "Cossack Squats"],
    High: ["Burpees (15 reps)", "Thrusters", "Sprints (100m)", "Jump Squats", "Diamond Pushups", "Box Jumps", "Pull Ups", "V-Ups", "Battle Ropes", "Clean & Press"]
  };

  const quotesPool = [
    { text: "Fitness is the ultimate form of honesty. You cannot cheat the grind.", author: "Daily Wisdom" },
    { text: "The iron never lies; it will always give you the real deal.", author: "Henry Rollins" },
    { text: "Integrity is doing the right thing, even when no one is watching your reps.", author: "Discipline" },
    { text: "Your body is a reflection of your lifestyle. It doesn't know how to lie.", author: "Wellness" },
    { text: "Discipline is telling yourself the truth and acting on it.", author: "Inspiration" }
  ];

  useEffect(() => {
    const randomQuote = quotesPool[Math.floor(Math.random() * quotesPool.length)];
    setDailyQuote(randomQuote);

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
    const completedIds = getTodaysCompletedQuests(user.id);
    const workouts = getWorkoutsForToday(user.id);
    
    setTodayWorkouts(workouts);
    setQuests(dailyPool.map(q => ({
      ...q,
      completed: completedIds.includes(q.id)
    })));
  }, [user.id]);

  const currentXp = user?.xp || 0;
  const maxXp = 100;
  const progressPercent = Math.min((currentXp / maxXp) * 100, 100);

  const handleGenerateWorkout = (level) => {
    const workoutList = exercisePool[level.id];
    setGeneratedWorkout({
      level: level.title,
      exercises: workoutList,
      xp: level.xp
    });
  };

  const handleCompleteWorkout = () => {
    if (!generatedWorkout) return;

    // Redundant log removed here to prevent double sessions.
    // The workout is now logged only once within WorkoutScreen.js.

    if (onWorkoutStart) {
      onWorkoutStart({
        level: generatedWorkout.level,
        exercises: generatedWorkout.exercises,
        xp: generatedWorkout.xp,
        intensity: generatedWorkout.level 
      });
    }

    setShowWorkoutModal(false);
    setGeneratedWorkout(null);
  };

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

  const hasEarlyBirdWorkout = todayWorkouts.some(w => {
    const date = new Date(w.timestamp);
    return date.getHours() < 8;
  });

  const allBadges = [
    { id: 1, title: 'Welcome Hero', desc: 'Account created', earned: true, color: '#10B981' },
    { id: 2, title: 'Early Bird', desc: 'Workout before 8 AM', earned: hasEarlyBirdWorkout, color: '#F59E0B' },
    { id: 3, title: 'Streak Master', desc: '7 days in a row', earned: user?.streak >= 7, color: '#6366F1' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.levelSub}>CURRENT RANK</Text>
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
               <Text style={styles.progressText}>{currentXp}/{maxXp} XP</Text>
               <Text style={styles.progressText}>Next: Lvl {user.level + 1}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardBase, styles.quoteCard]}>
          <View style={styles.quoteTopRow}>
            <QuoteIcon color="#6366F1" size={20} fill="#6366F120" />
            <Text style={styles.quoteTag}>DAILY FOCUS</Text>
          </View>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox 
            icon={<Target color="#1E40AF" size={18} />} 
            value={todayWorkouts.length} 
            label="Workouts" 
            sub="Today" 
            onPress={() => setShowWorkoutModal(true)}
          />
          <StatBox 
            icon={<Activity color="#059669" size={18} />} 
            value={user?.caloriesLogged || "0"} 
            label="Calories" 
            sub="Burned" 
          />
          <StatBox 
            icon={<Trophy color="#D97706" size={18} />} 
            value={allBadges.filter(b => b.earned).length} 
            label="Badges" 
            sub="Collected" 
            onPress={() => setShowAchievements(true)}
            style={styles.badgeStatBox}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Quests</Text>
          <View style={styles.xpBonusContainer}><Text style={styles.xpBonusText}>Earn XP</Text></View>
        </View>
        
        <View style={[styles.cardBase, styles.questCard]}>
          {quests.map((quest) => (
            <TouchableOpacity 
              key={quest.id} 
              style={styles.questItem} 
              onPress={() => handleQuestToggle(quest.id, quest.xp)}
              disabled={quest.completed}
            >
              <CheckCircle2 
                color={quest.completed ? '#10B981' : '#CBD5E1'} 
                size={22} 
                fill={quest.completed ? '#10B98120' : 'transparent'} 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.questText, quest.completed && styles.questTextDone]}>{quest.title}</Text>
              </View>
              {!quest.completed && <Text style={styles.questXpTag}>+{quest.xp} XP</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.cardBase, styles.achievementPrompt]} onPress={() => setShowAchievements(true)}>
          <View style={styles.achievementIconBox}><Award color="#F59E0B" size={22} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.achievementTitle}>View Hall of Fame</Text>
            <Text style={styles.achievementSub}>See all your earned milestones</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={showWorkoutModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{generatedWorkout ? 'Perform Workout' : 'Start Workout'}</Text>
              <TouchableOpacity onPress={() => { setShowWorkoutModal(false); setGeneratedWorkout(null); }}>
                <X color="#0F172A" size={24} />
              </TouchableOpacity>
            </View>

            {!generatedWorkout ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {intensities.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.intensityCard}
                    onPress={() => handleGenerateWorkout(item)}
                  >
                    <View style={[styles.intensityIcon, { backgroundColor: item.color + '15' }]}>
                      <Zap color={item.color} size={24} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={styles.intensityTitle}>{item.title}</Text>
                      <Text style={styles.intensityDesc}>{item.desc}</Text>
                    </View>
                    <ChevronRight color="#CBD5E1" size={20} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={{ flexShrink: 1 }}>
                <View style={styles.workoutBanner}>
                  <Dumbbell color="#1E3A8A" size={20} />
                  <Text style={styles.workoutBannerText}>{generatedWorkout.level} Routine • 10 Steps</Text>
                </View>
                <ScrollView contentContainerStyle={styles.exerciseList} showsVerticalScrollIndicator={false}>
                  {generatedWorkout.exercises.map((ex, idx) => (
                    <View key={idx} style={styles.exerciseItem}>
                      <View style={styles.exerciseIndexBox}>
                        <Text style={styles.exerciseIndex}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.exerciseName}>{ex}</Text>
                      <Timer color="#94A3B8" size={16} />
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteWorkout}>
                  <Text style={styles.completeBtnText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showAchievements} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Badges</Text>
              <TouchableOpacity onPress={() => setShowAchievements(false)}><X color="#0F172A" size={24} /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.badgeList} showsVerticalScrollIndicator={false}>
              {allBadges.map((badge) => (
                <View key={badge.id} style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: badge.earned ? badge.color + '15' : '#F1F5F9' }]}>
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
              <Text style={styles.closeBtnText}>Continue Your Journey</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 110 },
  cardBase: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  userName: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginTop: -2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  streakText: { marginLeft: 6, fontWeight: '800', fontSize: 16, color: '#0F172A' },
  levelCard: { backgroundColor: '#1E3A8A', borderRadius: 28, padding: 24, marginBottom: 16 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelTitle: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  xpBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  xpBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  progressContainer: { marginTop: 24 },
  progressBarBackground: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#60A5FA', borderRadius: 4 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  progressText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
  quoteCard: { padding: 20, marginBottom: 20, backgroundColor: '#F0F4FF' },
  quoteTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  quoteTag: { fontSize: 10, fontWeight: '800', color: '#6366F1', letterSpacing: 1 },
  quoteText: { fontSize: 15, color: '#1E1B4B', lineHeight: 22, fontWeight: '600', fontStyle: 'italic' },
  quoteAuthor: { fontSize: 12, color: '#6366F1', fontWeight: '700', marginTop: 12 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, padding: 14, minHeight: 110 },
  badgeStatBox: { borderColor: '#FED7AA', backgroundColor: '#FFFAF5' },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconWrapper: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  statTextWrapper: { marginTop: 'auto' },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  statSubLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  questCard: { padding: 8, marginBottom: 20 },
  questItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 2 },
  questText: { fontSize: 14, color: '#334155', fontWeight: '700' },
  questTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  questXpTag: { fontSize: 11, fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  xpBonusContainer: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  xpBonusText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  achievementPrompt: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 20 },
  achievementIconBox: { width: 44, height: 44, backgroundColor: '#FEF3C7', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  achievementTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  achievementSub: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 32, 
    padding: 24, 
    width: '100%', 
    maxWidth: 400, 
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  badgeList: { gap: 12, paddingBottom: 20 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9' },
  badgeLocked: { opacity: 0.5 },
  badgeIconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  badgeName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  badgeDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  closeBtn: { backgroundColor: '#1E3A8A', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  closeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  intensityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  intensityIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  intensityTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  intensityDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  workoutBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 16 },
  workoutBannerText: { fontSize: 14, fontWeight: '700', color: '#1E3A8A' },
  exerciseList: { gap: 10, paddingBottom: 20 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  exerciseIndexBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  exerciseIndex: { fontSize: 12, fontWeight: '900', color: '#1E3A8A' },
  exerciseName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#334155' },
  completeBtn: { backgroundColor: '#059669', padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 10, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  completeBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});