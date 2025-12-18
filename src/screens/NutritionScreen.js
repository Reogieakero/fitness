import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Keyboard, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Trash2, Brain, Plus, Database, Flame, ShieldCheck, 
  Edit3, X, History, ChevronLeft, AlertCircle, 
  Utensils, Beef, Wheat, Droplets, Target
} from 'lucide-react-native';

import { 
  saveMealToDB, 
  getMealsByDate, 
  deleteMealFromDB, 
  getAllMealDates 
} from '../database/database';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const { width } = Dimensions.get('window');

// --- CUSTOM COMPONENTS ---

const CustomAlert = ({ visible, title, message, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.alertIconWrapper}>
          <AlertCircle color="#6366F1" size={40} />
        </View>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function NutritionScreen({ userId }) {
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({ cal: 0, pro: 0, carb: 0, fat: 0 });
  const [showManual, setShowManual] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

  const [manualData, setManualData] = useState({
    foodName: '', calories: '', protein: '', carbs: '', fat: ''
  });

  const todayKey = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  const TARGETS = { cal: 2500, pro: 160, carb: 250, fat: 70 };

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  const loadData = (dateKey = todayKey) => {
    if (!userId) return;
    const data = getMealsByDate(userId, dateKey) || [];
    setMeals(data);
    calculateTotals(data);
    setHistoryDates(getAllMealDates(userId) || []);
  };

  const calculateTotals = (mealList) => {
    const totals = mealList.reduce((acc, m) => ({
      cal: acc.cal + (Number(m.calories) || 0),
      pro: acc.pro + (Number(m.protein) || 0),
      carb: acc.carb + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0)
    }), { cal: 0, pro: 0, carb: 0, fat: 0 });
    setDailyTotals(totals);
  };

  const handleSave = (mealObj) => {
    saveMealToDB(userId, { ...mealObj, date: todayKey });
    loadData();
  };

  const handleManualSave = () => {
    if (!manualData.foodName || !manualData.calories) {
      setAlertConfig({ visible: true, title: "Incomplete Data", message: "Please provide a food name and calorie amount." });
      return;
    }
    handleSave({
      ...manualData,
      grade: 'Manual',
      recommendation: 'Manually logged.'
    });
    setManualData({ foodName: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowManual(false);
    Keyboard.dismiss();
  };

  const analyzeFoodWithAI = async () => {
    if (!foodInput.trim() || loading) return;
    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze food: "${foodInput}". Return JSON: {"foodName": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "grade": "A|B|C|D|F", "recommendation": "string"}` }] }]
        })
      });

      const data = await response.json();
      const cleanJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
      const mealData = JSON.parse(cleanJson);

      handleSave(mealData);
      setFoodInput('');
    } catch (error) {
      setAlertConfig({ visible: true, title: "Analysis Failed", message: "Could not connect to the Lab. Please try manual entry." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    deleteMealFromDB(id);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>{viewHistory ? "ARCHIVE" : "DAILY FUEL"}</Text>
          <Text style={styles.headerTitle}>{viewHistory ? "Fuel History" : "Precision Lab"}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionCircle} onPress={() => setViewHistory(!viewHistory)}>
            {viewHistory ? <ChevronLeft color="#1E3A8A" size={20}/> : <History color="#1E3A8A" size={20} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {!viewHistory && (
          <>
            {/* Macro Dashboard - Consistent with Home.js Modal */}
            <View style={[styles.cardBase, styles.macroDashboard]}>
              <View style={styles.macroStat}>
                <Flame color="#EF4444" size={18} />
                <Text style={styles.macroValue}>{dailyTotals.cal}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroStat}>
                <Beef color="#F97316" size={18} />
                <Text style={styles.macroValue}>{dailyTotals.pro}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroStat}>
                <Wheat color="#F59E0B" size={18} />
                <Text style={styles.macroValue}>{dailyTotals.carb}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
            </View>

            {/* AI Input Section */}
            <View style={styles.inputSection}>
               <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Describe your meal (e.g. 2 eggs and toast)"
                    placeholderTextColor="#94A3B8"
                    value={foodInput}
                    onChangeText={setFoodInput}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={[styles.analyzeBtn, loading && { opacity: 0.7 }]} 
                    onPress={analyzeFoodWithAI} 
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Plus color="#FFF" size={24} />}
                  </TouchableOpacity>
               </View>
               <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManual(!showManual)}>
                  <Text style={styles.manualToggleText}>{showManual ? "Cancel Manual Entry" : "Or enter details manually"}</Text>
               </TouchableOpacity>
            </View>

            {showManual && (
              <View style={[styles.cardBase, styles.manualCard]}>
                <Text style={styles.manualTitle}>Manual Entry</Text>
                <TextInput 
                  style={styles.manualInput} 
                  placeholder="Food Name" 
                  value={manualData.foodName}
                  onChangeText={(t) => setManualData({...manualData, foodName: t})}
                />
                <View style={styles.manualGrid}>
                  <TextInput style={[styles.manualInput, { flex: 1 }]} placeholder="Cals" keyboardType="numeric" value={manualData.calories} onChangeText={(t) => setManualData({...manualData, calories: t})} />
                  <TextInput style={[styles.manualInput, { flex: 1 }]} placeholder="Prot" keyboardType="numeric" value={manualData.protein} onChangeText={(t) => setManualData({...manualData, protein: t})} />
                  <TextInput style={[styles.manualInput, { flex: 1 }]} placeholder="Carb" keyboardType="numeric" value={manualData.carbs} onChangeText={(t) => setManualData({...manualData, carbs: t})} />
                </View>
                <TouchableOpacity style={styles.saveManualBtn} onPress={handleManualSave}>
                  <Text style={styles.saveManualText}>LOG MEAL</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Logs</Text>
              <Text style={styles.sectionDate}>{displayDate}</Text>
            </View>
          </>
        )}

        {viewHistory ? (
          historyDates.map((date) => (
            <TouchableOpacity 
              key={date} 
              style={[styles.cardBase, styles.historyItem]}
              onPress={() => { loadData(date); setViewHistory(false); }}
            >
              <View style={styles.historyIconBox}><Database size={20} color="#6366F1" /></View>
              <Text style={styles.historyDateText}>{date === todayKey ? "Today's Log" : date}</Text>
              <ChevronLeft size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))
        ) : (
          meals.map((meal) => (
            <View key={meal.id} style={[styles.cardBase, styles.mealCard]}>
              <View style={styles.mealInfo}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealName}>{meal.foodName}</Text>
                  <View style={[styles.gradeBadge, { backgroundColor: '#F1F5F9' }]}>
                    <Text style={styles.gradeText}>{meal.grade}</Text>
                  </View>
                </View>
                <View style={styles.miniMacroRow}>
                  <Text style={styles.mealSub}>{meal.calories} kcal</Text>
                  <View style={styles.dot} />
                  <Text style={styles.mealSub}>P: {meal.protein}g</Text>
                  <View style={styles.dot} />
                  <Text style={styles.mealSub}>C: {meal.carbs}g</Text>
                </View>
                <Text style={styles.recommendationText}>{meal.recommendation}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(meal.id)} style={styles.deleteBtn}>
                <Trash2 color="#EF4444" size={18} />
              </TouchableOpacity>
            </View>
          ))
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  cardBase: { backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  scrollContent: { paddingHorizontal: 20 },
  
  // Macro Dashboard Consistency
  macroDashboard: { flexDirection: 'row', padding: 20, marginBottom: 20, justifyContent: 'space-around', alignItems: 'center' },
  macroStat: { alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  macroLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  macroDivider: { width: 1, height: '60%', backgroundColor: '#E2E8F0' },

  // Input Section
  inputSection: { marginBottom: 24 },
  inputContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  textInput: { flex: 1, color: '#0F172A', paddingHorizontal: 15, fontSize: 14, height: 48, fontWeight: '600' },
  analyzeBtn: { width: 48, height: 48, backgroundColor: '#1E3A8A', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  manualToggle: { marginTop: 12, alignSelf: 'center' },
  manualToggleText: { color: '#6366F1', fontWeight: '700', fontSize: 13 },

  // Manual Card
  manualCard: { padding: 20, marginBottom: 20, borderColor: '#6366F1' },
  manualTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  manualInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A' },
  manualGrid: { flexDirection: 'row', gap: 8 },
  saveManualBtn: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveManualText: { color: '#FFF', fontWeight: '900' },

  // List Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  sectionDate: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  // Meal Cards
  mealCard: { padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  mealInfo: { flex: 1 },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  mealName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginRight: 8 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  gradeText: { fontSize: 11, fontWeight: '900', color: '#1E3A8A' },
  miniMacroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealSub: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  recommendationText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', lineHeight: 18 },
  deleteBtn: { padding: 8 },

  // History
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 10 },
  historyIconBox: { width: 40, height: 40, backgroundColor: '#EEF2FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyDateText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },

  // Alert Modal (Consistent with Home.js)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, width: '100%', maxWidth: 450, alignItems: 'center' },
  alertIconWrapper: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  alertMessage: { textAlign: 'center', color: '#64748B', lineHeight: 20, marginBottom: 20 },
  closeBtn: { backgroundColor: '#1E3A8A', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16, width: '100%', alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 }
});