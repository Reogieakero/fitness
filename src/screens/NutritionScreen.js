import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Sparkles,
  History,
  Trash2,
  PlusCircle,
  BrainCircuit,
  ShieldCheck,
} from 'lucide-react-native';

// Import your DB functions (Adjust path as necessary)
import { saveMealToDB, getMealsForToday, deleteMealFromDB } from '../database/database'; 

export default function NutritionScreen({ route }) {
  // Assuming you pass the logged-in userId via navigation or a global state
  // Using a fallback ID of 1 for demonstration
  const userId = route?.params?.userId || 1; 

  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState([]);

  // 1. Load data from SQLite on mount
  useEffect(() => {
    loadTodaysMeals();
  }, []);

  const loadTodaysMeals = () => {
    try {
      const storedMeals = getMealsForToday(userId);
      setMealPlan(storedMeals);
    } catch (error) {
      console.error("Failed to load meals:", error);
    }
  };

  const totals = useMemo(() => {
    return mealPlan.reduce(
      (acc, meal) => ({
        calories: acc.calories + (Number(meal.calories) || 0),
        protein: acc.protein + (Number(meal.protein) || 0),
        carbs: acc.carbs + (Number(meal.carbs) || 0),
        fat: acc.fat + (Number(meal.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [mealPlan]);

  const analyzeNutrition = async () => {
    if (!query.trim()) return;
    setLoading(true);

    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

    const prompt = `
      You are an expert sports nutritionist. Analyze this food: "${query}"
      Return ONLY valid JSON.
      JSON SCHEMA:
      {
        "foodName": "string",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "recommendation": "1 sentence advice",
        "grade": "A|B|C|D"
      }`;

    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      });

      const resJson = await response.json();
      const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      
      if (!parsed.foodName) parsed.foodName = query; 
      setData(parsed);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze food.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Updated: Save to DB then refresh UI
  const addToPlanner = () => {
    if (data) {
      try {
        saveMealToDB(userId, data); // Persistence
        loadTodaysMeals();          // Refresh list from DB
        setData(null); 
        setQuery(''); 
      } catch (error) {
        Alert.alert("Database Error", "Could not save your meal.");
      }
    }
  };

  // 3. Updated: Remove from DB then refresh UI
  const removeMeal = (id) => {
    try {
      deleteMealFromDB(id); // Delete from SQLite
      loadTodaysMeals();     // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not delete the meal.");
    }
  };

  const getGradeColor = (grade) => {
    const map = { A: '#10B981', B: '#6366F1', C: '#F59E0B', D: '#EF4444' };
    return map[grade] || '#64748B';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>DAILY TARGETS</Text>
              <Text style={styles.userName}>{totals.calories} <Text style={styles.unitText}>kcal</Text></Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{totals.protein}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputWrapper}>
              <Search color="#94A3B8" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 2 boiled eggs and toast"
                value={query}
                onChangeText={setQuery}
              />
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={analyzeNutrition} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <View style={styles.btnRow}>
                  <Sparkles color="#FFF" size={18} />
                  <Text style={styles.actionBtnText}>Analyze Meal</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {data && (
            <View style={styles.previewWrapper}>
              <View style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.levelSub}>ESTIMATE FOR: {data.foodName.toUpperCase()}</Text>
                    <Text style={styles.levelTitle}>{data.calories} KCAL</Text>
                  </View>
                  <TouchableOpacity onPress={addToPlanner}>
                    <PlusCircle color="#FFF" size={40} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.adviceCard}>
                <View style={styles.adviceHeader}>
                  <ShieldCheck color="#6366F1" size={16} />
                  <Text style={styles.adviceTag}>AI INSIGHT</Text>
                </View>
                <Text style={styles.adviceText}>"{data.recommendation}"</Text>
                <TouchableOpacity style={styles.logBtn} onPress={addToPlanner}>
                  <Text style={styles.logBtnText}>Confirm & Add to Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <History size={20} color="#64748B" />
            <Text style={styles.sectionTitle}>Today's Log</Text>
          </View>

          {mealPlan.length === 0 ? (
            <View style={styles.emptyState}>
              <BrainCircuit size={40} color="#E2E8F0" />
              <Text style={styles.emptyText}>No meals logged today.</Text>
            </View>
          ) : (
            mealPlan.map((item) => (
              <View key={item.id} style={styles.mealItem}>
                <View style={[styles.gradeStrip, { backgroundColor: getGradeColor(item.grade) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>{item.foodName}</Text>
                  <Text style={styles.mealSubtext}>
                    {item.calories} kcal  •  P: {item.protein}g  •  C: {item.carbs}g
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMeal(item.id)}>
                  <Trash2 size={20} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.2 },
  userName: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  unitText: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
  statBadge: { backgroundColor: '#EEF2FF', padding: 12, borderRadius: 16, alignItems: 'center', minWidth: 80 },
  statValue: { color: '#4338CA', fontWeight: '900', fontSize: 18 },
  statLabel: { color: '#6366F1', fontSize: 10, fontWeight: '700' },
  inputCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 15, marginBottom: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  actionBtn: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 18, alignItems: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  previewWrapper: { marginTop: 20, marginBottom: 30 },
  levelCard: { backgroundColor: '#1E3A8A', padding: 24, borderRadius: 28, zIndex: 2 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelSub: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800' },
  levelTitle: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  adviceCard: { backgroundColor: '#FFF', padding: 24, paddingTop: 35, marginTop: -20, borderRadius: 28, borderWidth: 1, borderColor: '#E2E8F0' },
  adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  adviceTag: { color: '#6366F1', fontSize: 10, fontWeight: '800' },
  adviceText: { fontSize: 15, color: '#475569', fontStyle: 'italic', marginBottom: 20, lineHeight: 22 },
  logBtn: { backgroundColor: '#6366F1', padding: 14, borderRadius: 14, alignItems: 'center' },
  logBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  mealItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  gradeStrip: { width: 5, height: '80%', borderRadius: 10, marginRight: 15 },
  mealName: { fontWeight: '800', color: '#1E293B', fontSize: 16, marginBottom: 4 },
  mealSubtext: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 20 },
});