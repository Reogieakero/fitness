import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Modal, Animated, Dimensions, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, Flame, Trophy, ChevronRight, Award, Activity, X,
  CheckCircle2, Quote as QuoteIcon, Zap, Dumbbell, AlertCircle,
  Utensils, Shield, Crown, Droplets, Beef, Wheat, Info
} from 'lucide-react-native';

import { 
  updateUserStatsInDB, saveQuestCompletion, getTodaysCompletedQuests,
  getWorkoutsForToday, getTodayTotalCalories, getMealsForToday, getWorkoutStreak
} from '../database/database';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- ASSET MAPPING ---
const EXERCISE_GIFS = {
  'AIR BIKE': require('../../assets/FITNESS APP/AIR BIKE.gif'),
  'BRIDGE': require('../../assets/FITNESS APP/BRIDGE.gif'),
  'BURPEES': require('../../assets/FITNESS APP/BURPEES.gif'),
  'JUMPING JACKS': require('../../assets/FITNESS APP/JUMPING JACKS.gif'),
  'LEG RAISE': require('../../assets/FITNESS APP/LEG RAISE.gif'),
  'LUNGES': require('../../assets/FITNESS APP/LUNGES.gif'),
  'MOUNTAIN CLIMBER': require('../../assets/FITNESS APP/MOUNTAIN CLIMBER.gif'),
  'PLANK WITH LEG RAISE': require('../../assets/FITNESS APP/PLANK WITH LEG RAISE.gif'),
  'PUSH UPS': require('../../assets/FITNESS APP/PUSH UPS.gif'),
  'RUNNING IN PLACE': require('../../assets/FITNESS APP/RUNNING IN PLACE.gif'),
  'SIDE LEG RAISE': require('../../assets/FITNESS APP/SIDE LEG RAISE.gif'),
  'SIDE LUNGES': require('../../assets/FITNESS APP/SIDE LUNGES.gif'),
  'SIT UPS': require('../../assets/FITNESS APP/SIT UPS.gif'),
  'SQUATS': require('../../assets/FITNESS APP/SQUATS.gif'),
  'SUPERMAN': require('../../assets/FITNESS APP/SUPERMAN.gif'),
  'WALL SIT': require('../../assets/FITNESS APP/WALL SIT.gif'),
};

// Descriptions for each exercise
const EXERCISE_DESCRIPTIONS = {
  'AIR BIKE': "Lie on your back and simulate a cycling motion to target your obliques and core.",
  'BRIDGE': "Lifting your hips while lying flat to strengthen glutes and lower back stability.",
  'BURPEES': "A full-body explosive movement combining a squat, push-up, and jump.",
  'JUMPING JACKS': "Classic cardio move to increase heart rate and improve full-body coordination.",
  'LEG RAISE': "Lower abdominal focus by lifting straight legs from a laying position.",
  'LUNGES': "Step forward and lower hips to develop lower body strength and balance.",
  'MOUNTAIN CLIMBER': "High-intensity core and cardio move simulating a vertical climb on the floor.",
  'PLANK WITH LEG RAISE': "Core stability challenge adding leg lifts to a standard plank position.",
  'PUSH UPS': "Fundamental upper body exercise for chest, shoulders, and triceps.",
  'RUNNING IN PLACE': "High knees or steady pace running to boost metabolic burn.",
  'SIDE LEG RAISE': "Targets the hip abductors and outer thighs for better lateral stability.",
  'SIDE LUNGES': "Lateral movement focusing on inner and outer thighs and glutes.",
  'SIT UPS': "Core isolation exercise to strengthen the abdominal wall.",
  'SQUATS': "The king of leg exercises for building powerful glutes and quads.",
  'SUPERMAN': "Lying face down and lifting limbs to strengthen the entire posterior chain.",
  'WALL SIT': "Isometric hold against a wall to build endurance in the quadriceps.",
};

const HERO_RANKS = {
  1: "Novice Recruit", 2: "Aspiring Hero", 3: "Street Guard", 4: "Local Legend",
  5: "Rising Star", 6: "Elite Operative", 7: "Vigilante", 8: "Shield Bearer",
  9: "Justice Bringer", 10: "Shadow Striker", 11: "Titan Initiate", 12: "Iron Will",
  13: "Master Combatant", 14: "Apex Warrior", 15: "Grand Protector", 16: "Mythic Force",
  17: "God-Tier Athlete", 18: "Eternal Champion", 19: "Universal Defender", 20: "Supreme Overlord"
};

const RANK_COLORS = { low: '#94A3B8', mid: '#6366F1', high: '#F59E0B', max: '#EF4444' };

const ActionModal = ({ visible, title, message, type = 'success', onClose }) => {
  const themes = {
    success: { bg: '#DCFCE7', icon: '#10B981', btn: '#059669', color: '#064E3B' },
    info: { bg: '#DBEAFE', icon: '#3B82F6', btn: '#1E3A8A', color: '#1E3A8A' },
    warning: { bg: '#FEF3C7', icon: '#F59E0B', btn: '#D97706', color: '#78350F' }
  };
  const theme = themes[type];
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { opacity, transform: [{ scale }] }]}>
          <View style={[styles.alertIconWrapper, { backgroundColor: theme.bg }]}>
            {type === 'success' ? <Trophy color={theme.icon} size={40} /> : <AlertCircle color={theme.icon} size={40} />}
          </View>
          <Text style={[styles.modalTitle, { color: theme.color }]}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.btn, marginTop: 10 }]} onPress={handleClose}>
            <Text style={styles.closeBtnText}>CONTINUE</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const StatBox = ({ icon, value, label, sub, onPress, style }) => (
  <TouchableOpacity style={[styles.cardBase, styles.statBox, style]} onPress={onPress} disabled={!onPress}>
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
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [user, setUser] = useState(initialUser);
  const [quests, setQuests] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [todayMeals, setTodayMeals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' });

  const nutritionAnim = useRef(new Animated.Value(0)).current;
  const workoutAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const xpPulse = useRef(new Animated.Value(1)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;

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
      Monday: [{ id: 'q1', title: "Drink 2L of water", xp: 20 }, { id: 'q2', title: "Morning Stretch", xp: 15 }, { id: 'q3', title: "Log Breakfast", xp: 15 }],
      Tuesday: [{ id: 't1', title: "Walk 1,000 steps", xp: 25 }, { id: 't2', title: "No Sugary Drinks", xp: 15 }, { id: 't3', title: "10 Pushups", xp: 10 }],
      default: [{ id: 'd1', title: "Complete HIIT Session", xp: 30 }, { id: 'd2', title: "Log Food", xp: 10 }, { id: 'd3', title: "Drink 8 glasses of water", xp: 10 }]
    };
    const dailyPool = questPool[todayName] || questPool.default;
    const completedIds = getTodaysCompletedQuests(user.id);
    setTodayWorkouts(getWorkoutsForToday(user.id));
    setCaloriesConsumed(getTodayTotalCalories(user.id));
    setTodayMeals(getMealsForToday(user.id));
    setStreak(getWorkoutStreak(user.id));
    setQuests(dailyPool.map(q => ({ ...q, completed: completedIds.includes(q.id) })));
  }, [user.id]);

  const openModal = (setter, animValue) => {
    setter(true);
    Animated.spring(animValue, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };

  const closeModal = (setter, animValue) => {
    Animated.timing(animValue, { toValue: 0.7, duration: 200, useNativeDriver: true }).start(() => {
      setter(false);
      animValue.setValue(0);
    });
  };

  const intensities = [
    { id: 'Low', title: 'Light', desc: 'Focus on mobility and steady movement.', color: '#10B981', xp: 15 },
    { id: 'Medium', title: 'Moderate', desc: 'Balanced cardio and strength routine.', color: '#6366F1', xp: 30 },
    { id: 'High', title: 'Intense', desc: 'High-energy HIIT and heavy lifting.', color: '#EF4444', xp: 50 },
  ];

  const exercisePool = {
    Low: ["BRIDGE", "LEG RAISE", "SIDE LEG RAISE", "WALL SIT"],
    Medium: ["SQUATS", "SIT UPS", "LUNGES", "PUSH UPS", "SIDE LUNGES", "AIR BIKE"],
    High: ["BURPEES", "JUMPING JACKS", "MOUNTAIN CLIMBER", "RUNNING IN PLACE", "PLANK WITH LEG RAISE", "SUPERMAN"]
  };

  const currentXp = user?.xp || 0;
  const maxXp = 100;
  const progressPercent = Math.min((currentXp / maxXp) * 100, 100);

  const totalMacros = todayMeals.reduce((acc, meal) => ({
    p: acc.p + (Number(meal.protein) || 0),
    c: acc.c + (Number(meal.carbs) || 0),
    f: acc.f + (Number(meal.fat) || 0)
  }), { p: 0, c: 0, f: 0 });

  const triggerXpAnimation = () => {
    xpOpacity.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(xpPulse, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(xpPulse, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.timing(xpOpacity, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true })
    ]).start();
  };

  const handleGenerateWorkout = (level) => {
    const selectedNames = exercisePool[level.id];
    const exerciseData = selectedNames.map(name => ({
      name: name,
      gif: EXERCISE_GIFS[name],
      description: EXERCISE_DESCRIPTIONS[name] // Map description
    }));
    setGeneratedWorkout({ level: level.title, exercises: exerciseData, xp: level.xp });
  };

  const handleCompleteWorkout = () => {
    if (!generatedWorkout) return;
    if (onWorkoutStart) {
      onWorkoutStart({ ...generatedWorkout, intensity: generatedWorkout.level });
    }
    closeModal(setShowWorkoutModal, workoutAnim);
    setGeneratedWorkout(null);
  };

  const handleQuestToggle = (questId, questXp) => {
    const isAlreadyDone = quests.find(q => q.id === questId)?.completed;
    if (isAlreadyDone) return;
    triggerXpAnimation();
    let newXp = currentXp + questXp;
    let newLevel = user.level || 1;
    let leveledUp = false;
    if (newXp >= maxXp && newLevel < 20) {
      newLevel += 1;
      newXp = newXp - maxXp;
      leveledUp = true;
    }
    updateUserStatsInDB(user.id, newXp, newLevel);
    saveQuestCompletion(user.id, questId);
    setUser(prev => ({ ...prev, xp: newXp, level: newLevel }));
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
    if (leveledUp) {
      setAlertConfig({ visible: true, title: "RANK ASCENSION!", message: `Rank achieved: ${HERO_RANKS[newLevel]}. Welcome to Lvl ${newLevel}!`, type: 'success' });
    }
  };

  const levelBadges = Object.keys(HERO_RANKS).map(lvl => {
    const levelInt = parseInt(lvl);
    return {
      id: `lvl-${lvl}`,
      title: HERO_RANKS[lvl],
      desc: `Reached Level ${lvl}`,
      earned: user.level >= levelInt,
      color: levelInt > 15 ? RANK_COLORS.max : levelInt > 10 ? RANK_COLORS.high : levelInt > 5 ? RANK_COLORS.mid : RANK_COLORS.low,
      isLevelBadge: true
    };
  });

  const allBadges = [{ id: 'welcome', title: 'Hero Origin', desc: 'Account Created', earned: true, color: '#10B981' }, ...levelBadges];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ActionModal 
        visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} 
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Day,</Text>
            <Text style={styles.userName}>{user.firstName}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame color="#F97316" size={18} fill="#F97316" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        <Animated.View style={[styles.levelCard, { transform: [{ scale: xpPulse }] }]}>
          <Animated.View style={[styles.xpGlow, { opacity: xpOpacity }]} />
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelSub}>HERO RANK</Text>
              <Text style={styles.levelTitle}>{HERO_RANKS[user.level] || "Legend"}</Text>
            </View>
            <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>LVL {user.level}</Text></View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} /></View>
            <View style={styles.progressLabelRow}>
               <Text style={styles.progressText}>{currentXp}/{maxXp} XP</Text>
               <Text style={styles.progressText}>{user.level < 20 ? `Next: Lvl ${user.level + 1}` : 'MAX LEVEL'}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={[styles.cardBase, styles.quoteCard]}>
          <View style={styles.quoteTopRow}><QuoteIcon color="#6366F1" size={20} fill="#6366F120" /><Text style={styles.quoteTag}>DAILY FOCUS</Text></View>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox icon={<Target color="#1E40AF" size={18} />} value={todayWorkouts.length} label="Workouts" sub="Today" onPress={() => openModal(setShowWorkoutModal, workoutAnim)} />
          <StatBox icon={<Activity color="#059669" size={18} />} value={caloriesConsumed || 0} label="Calories" sub="Consumed" onPress={() => openModal(setShowNutritionModal, nutritionAnim)} />
          <StatBox icon={<Trophy color="#D97706" size={18} />} value={allBadges.filter(b => b.earned).length} label="Badges" sub="Collected" onPress={() => openModal(setShowAchievements, badgeAnim)} style={styles.badgeStatBox} />
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Daily Quests</Text></View>
        <View style={[styles.cardBase, styles.questCard]}>
          {quests.map((quest) => (
            <TouchableOpacity key={quest.id} style={styles.questItem} onPress={() => handleQuestToggle(quest.id, quest.xp)} disabled={quest.completed}>
              <CheckCircle2 color={quest.completed ? '#10B981' : '#CBD5E1'} size={22} fill={quest.completed ? '#10B98120' : 'transparent'} />
              <View style={{ flex: 1, marginLeft: 12 }}><Text style={[styles.questText, quest.completed && styles.questTextDone]}>{quest.title}</Text></View>
              {!quest.completed && <Text style={styles.questXpTag}>+{quest.xp} XP</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.cardBase, styles.achievementPrompt]} onPress={() => openModal(setShowAchievements, badgeAnim)}>
          <View style={styles.achievementIconBox}><Award color="#F59E0B" size={22} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.achievementTitle}>View Hall of Fame</Text>
            <Text style={styles.achievementSub}>Level {user.level} rank rewards active</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
      </ScrollView>

      {/* --- NUTRITION MODAL --- */}
      <Modal visible={showNutritionModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, styles.polishedModal, { height: '85%', opacity: nutritionAnim, transform: [{ scale: nutritionAnim }] }]}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>Daily Fuel</Text><Text style={styles.modalSubHeader}>Metabolic Log</Text></View>
              <TouchableOpacity onPress={() => closeModal(setShowNutritionModal, nutritionAnim)}><X color="#0F172A" size={24} /></TouchableOpacity>
            </View>
            <div style={styles.macroDashboard}>
                <View style={styles.macroStat}><Beef color="#EF4444" size={18} /><Text style={styles.macroValue}>{totalMacros.p}g</Text><Text style={styles.macroLabel}>Protein</Text></View>
                <View style={styles.macroDivider} />
                <View style={styles.macroStat}><Wheat color="#F59E0B" size={18} /><Text style={styles.macroValue}>{totalMacros.c}g</Text><Text style={styles.macroLabel}>Carbs</Text></View>
                <View style={styles.macroDivider} />
                <View style={styles.macroStat}><Droplets color="#3B82F6" size={18} /><Text style={styles.macroValue}>{totalMacros.f}g</Text><Text style={styles.macroLabel}>Fats</Text></View>
            </div>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
              {todayMeals.length === 0 ? (
                <View style={styles.emptyContainer}><Utensils color="#CBD5E1" size={48} /><Text style={styles.emptyText}>No fuel logged today.</Text></View>
              ) : (
                todayMeals.map((meal, index) => (
                  <View key={index} style={styles.mealCardPro}>
                    <View style={styles.mealInfoPro}>
                      <Text style={styles.mealNamePro}>{meal.foodName}</Text>
                      <View style={styles.miniMacroRow}>
                         <View style={[styles.miniBadge, { backgroundColor: '#FEE2E2' }]}><Text style={[styles.miniBadgeText, { color: '#B91C1C' }]}>P {meal.protein}g</Text></View>
                         <View style={[styles.miniBadge, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.miniBadgeText, { color: '#B45309' }]}>C {meal.carbs}g</Text></View>
                         <View style={[styles.miniBadge, { backgroundColor: '#DBEAFE' }]}><Text style={[styles.miniBadgeText, { color: '#1D4ED8' }]}>F {meal.fat}g</Text></View>
                      </View>
                    </View>
                    <View style={styles.mealCalContainerPro}><Text style={styles.mealCalValuePro}>{meal.calories}</Text><Text style={styles.mealCalUnitPro}>kcal</Text></View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}><TouchableOpacity style={styles.closeBtn} onPress={() => closeModal(setShowNutritionModal, nutritionAnim)}><Text style={styles.closeBtnText}>RETURN TO LAB</Text></TouchableOpacity></View>
          </Animated.View>
        </View>
      </Modal>

      {/* --- MISSION MODAL --- */}
      <Modal visible={showWorkoutModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, styles.polishedModal, { height: '80%', opacity: workoutAnim, transform: [{ scale: workoutAnim }] }]}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>{generatedWorkout ? 'Mission File' : 'Mission Selection'}</Text></View>
              <TouchableOpacity onPress={() => closeModal(setShowWorkoutModal, workoutAnim)}><X color="#0F172A" size={24} /></TouchableOpacity>
            </View>
            <View style={{ flex: 1, width: '100%' }}>
              {!generatedWorkout ? (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                  {intensities.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.intensityCard} onPress={() => handleGenerateWorkout(item)}>
                      <View style={[styles.intensityIcon, { backgroundColor: item.color + '15' }]}><Zap color={item.color} size={24} /></View>
                      <View style={{ flex: 1, marginLeft: 15 }}><Text style={styles.intensityTitle}>{item.title}</Text><Text style={styles.intensityDesc}>{item.desc}</Text></View>
                      <ChevronRight color="#CBD5E1" size={20} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={{ flex: 1 }}>
                  <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
                    <View style={styles.workoutBanner}><Dumbbell color="#1E3A8A" size={20} /><Text style={styles.workoutBannerText}>Mission XP: +{generatedWorkout.xp}</Text></View>
                    {generatedWorkout.exercises.map((ex, idx) => (
                      <View key={idx} style={styles.exerciseItem}>
                        <View style={styles.exerciseIndexBox}><Text style={styles.exerciseIndex}>{idx + 1}</Text></View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          {/* Display Description in Mission File */}
                          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{ex.description}</Text>
                          <Image 
                             source={ex.gif} 
                             style={{ width: 80, height: 80, marginTop: 10, borderRadius: 12 }} 
                             resizeMode="contain"
                          />
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.modalFooter}><TouchableOpacity style={styles.completeBtn} onPress={handleCompleteWorkout}><Text style={styles.completeBtnText}>ENGAGE PROTOCOL</Text></TouchableOpacity></View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* --- HALL OF FAME MODAL --- */}
      <Modal visible={showAchievements} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { height: '85%', opacity: badgeAnim, transform: [{ scale: badgeAnim }] }]}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Hall of Fame</Text><TouchableOpacity onPress={() => closeModal(setShowAchievements, badgeAnim)}><X color="#0F172A" size={24} /></TouchableOpacity></View>
            <ScrollView contentContainerStyle={styles.badgeList} showsVerticalScrollIndicator={false}>
              {allBadges.map((badge) => (
                <View key={badge.id} style={[styles.badgeItem, !badge.earned && styles.badgeLocked]}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: badge.earned ? badge.color + '15' : '#F1F5F9' }]}>
                    {badge.id === 'lvl-20' ? <Crown color={badge.earned ? badge.color : '#94A3B8'} size={28} /> : <Shield color={badge.earned ? badge.color : '#94A3B8'} size={28} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}><Text style={[styles.badgeName, !badge.earned && { color: '#94A3B8' }]}>{badge.title}</Text><Text style={styles.badgeDesc}>{badge.desc}</Text></View>
                  {badge.earned && <CheckCircle2 color="#10B981" size={18} />}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeModal(setShowAchievements, badgeAnim)}><Text style={styles.closeBtnText}>CLOSE HALL</Text></TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 110 },
  cardBase: { backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
  userName: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  streakText: { marginLeft: 6, fontWeight: '800', fontSize: 16, color: '#0F172A' },
  levelCard: { backgroundColor: '#1E3A8A', borderRadius: 28, padding: 24, marginBottom: 16, overflow: 'hidden' },
  xpGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: '#60A5FA', opacity: 0 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800' },
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
  quoteTag: { fontSize: 10, fontWeight: '800', color: '#6366F1' },
  quoteText: { fontSize: 15, color: '#1E1B4B', fontWeight: '600', fontStyle: 'italic' },
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
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  questCard: { padding: 8, marginBottom: 20 },
  questItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 2 },
  questText: { fontSize: 14, color: '#334155', fontWeight: '700' },
  questTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  questXpTag: { fontSize: 11, fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  achievementPrompt: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 20 },
  achievementIconBox: { width: 44, height: 44, backgroundColor: '#FEF3C7', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  achievementTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  achievementSub: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, width: '100%', maxWidth: 450, elevation: 20 },
  polishedModal: { paddingHorizontal: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  modalSubHeader: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  macroDashboard: { flexDirection: 'row', backgroundColor: '#F8FAFC', marginHorizontal: 24, padding: 16, borderRadius: 24, marginBottom: 24, borderWeight: 1, borderColor: '#F1F5F9', justifyContent: 'space-around' },
  macroStat: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  macroLabel: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  macroDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0', alignSelf: 'center' },
  mealCardPro: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  mealInfoPro: { flex: 1 },
  mealNamePro: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  miniMacroRow: { flexDirection: 'row', gap: 6 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  mealCalContainerPro: { alignItems: 'flex-end', marginLeft: 12 },
  mealCalValuePro: { fontSize: 18, fontWeight: '900', color: '#059669' },
  mealCalUnitPro: { fontSize: 10, fontWeight: '700', color: '#059669', marginTop: -2 },
  intensityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  intensityIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  intensityTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  intensityDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  workoutBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, marginBottom: 16 },
  workoutBannerText: { fontSize: 13, fontWeight: '700', color: '#1E3A8A' },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 10 },
  exerciseIndexBox: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  exerciseIndex: { fontSize: 11, fontWeight: '900', color: '#1E3A8A' },
  exerciseName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#334155' },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', padding: 20, backgroundColor: '#FFF' },
  completeBtn: { backgroundColor: '#059669', padding: 18, borderRadius: 20, alignItems: 'center' },
  completeBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  closeBtn: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 16, alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontWeight: '800' },
  badgeList: { paddingBottom: 20 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: '#F8FAFC', marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  badgeLocked: { opacity: 0.3 },
  badgeIconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  badgeName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  badgeDesc: { fontSize: 11, color: '#64748B' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontWeight: '600', marginTop: 12 },
  alertIconWrapper: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  alertMessage: { textAlign: 'center', color: '#64748B', lineHeight: 20 }
});