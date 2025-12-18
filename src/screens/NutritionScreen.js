import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Apple, Utensils, Trash2, Brain, 
  Plus, Info, Flame, Scale 
} from 'lucide-react-native';

import { 
  saveMealToDB, 
  getMealsForToday, 
  deleteMealFromDB 
} from '../database/database';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export default function NutritionScreen({ userId }) {
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({ cal: 0, pro: 0, carb: 0, fat: 0, fib: 0 });

  useEffect(() => {
    if (userId) {
      loadTodayData();
    }
  }, [userId]);

  const loadTodayData = () => {
    if (!userId) return;
    try {
      const data = getMealsForToday(userId);
      const safeData = data || [];
      setMeals(safeData);
      calculateTotals(safeData);
    } catch (error) {
      console.error("Load Error:", error);
    }
  };

  const calculateTotals = (mealList) => {
    const totals = mealList.reduce((acc, m) => ({
      cal: acc.cal + (Number(m.calories) || 0),
      pro: acc.pro + (Number(m.protein) || 0),
      carb: acc.carb + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
      fib: acc.fib + (Number(m.fiber) || 0)
    }), { cal: 0, pro: 0, carb: 0, fat: 0, fib: 0 });
    setDailyTotals(totals);
  };

  const analyzeFoodWithAI = async () => {
    if (!foodInput.trim()) return;
    if (!GEMINI_API_KEY) {
      Alert.alert("Config Error", "API Key not found. Please restart Expo.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const prompt = `Act as a nutritionist. Analyze: "${foodInput}". 
    Return ONLY a raw JSON object. Do not include markdown or backticks.
    {
      "foodName": "name", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number, 
      "fiber": number, 
      "grade": "A-F", 
      "recommendation": "one short sentence"
    }`;

    try {
      // UPDATED URL: Using v1/models/gemini-1.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Log the specific Google error to terminal
        console.error("Google API Error:", data.error);
        throw new Error(data.error?.message || "API Request Failed");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Safety: Strip any markdown code blocks if AI ignored the "raw" instruction
      const cleanJson = textResponse.replace(/```json|```/g, '').trim();
      const mealData = JSON.parse(cleanJson);

      saveMealToDB(userId, mealData);
      
      setFoodInput('');
      loadTodayData();
      Alert.alert("Success", `${mealData.foodName} added.`);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      Alert.alert("Analysis Failed", "AI could not process this description. Check your console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    deleteMealFromDB(id);
    loadTodayData();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Nutrition Lab</Text>
            <Text style={styles.headerSub}>Track your performance fuel</Text>
          </View>
          <View style={styles.aiBadge}>
            <Brain color="#8B5CF6" size={14} />
            <Text style={styles.aiText}>AI SCANNER</Text>
          </View>
        </View>

        <View style={styles.dashboardCard}>
          <View style={styles.mainStat}>
            <View style={styles.iconCircle}>
              <Flame color="#FFF" size={24} />
            </View>
            <View>
              <Text style={styles.totalValue}>{dailyTotals.cal}</Text>
              <Text style={styles.totalLabel}>Total Calories Today</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.macroRow}>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{dailyTotals.pro}g</Text>
              <Text style={styles.macroLab}>Protein</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{dailyTotals.carb}g</Text>
              <Text style={styles.macroLab}>Carbs</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{dailyTotals.fat}g</Text>
              <Text style={styles.macroLab}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Analyze Meal</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 250g grilled chicken"
              placeholderTextColor="#94A3B8"
              value={foodInput}
              onChangeText={setFoodInput}
            />
            <TouchableOpacity 
              style={[styles.actionBtn, loading && { opacity: 0.6 }]}
              onPress={analyzeFoodWithAI}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Plus color="#FFF" size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Today's Entries</Text>
        {meals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Utensils color="#CBD5E1" size={48} />
            <Text style={styles.emptyText}>No data for today yet.</Text>
          </View>
        ) : (
          meals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealTop}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{meal.grade}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.mealTitle}>{meal.foodName}</Text>
                  <Text style={styles.mealSub}>
                    {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(meal.id)}>
                  <Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>
              </View>
              <View style={styles.recBox}>
                <Info color="#6366F1" size={14} />
                <Text style={styles.recText}>{meal.recommendation}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  headerSub: { color: '#64748B', fontSize: 14 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  aiText: { marginLeft: 5, fontSize: 10, fontWeight: '800', color: '#7C3AED' },
  dashboardCard: { backgroundColor: '#1E293B', borderRadius: 25, padding: 20, elevation: 4 },
  mainStat: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  totalValue: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  totalLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBox: { alignItems: 'center' },
  macroVal: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  macroLab: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
  inputSection: { marginVertical: 25 },
  sectionLabel: { fontSize: 16, fontWeight: '800', color: '#334155', marginBottom: 12 },
  searchBar: { flexDirection: 'row', gap: 10 },
  textInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15 },
  actionBtn: { width: 55, height: 55, backgroundColor: '#6366F1', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  mealCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  mealTop: { flexDirection: 'row', alignItems: 'center' },
  gradeBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  gradeText: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  mealTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  mealSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  recBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', padding: 10, borderRadius: 12, marginTop: 12, gap: 8 },
  recText: { flex: 1, fontSize: 12, color: '#5B21B6', lineHeight: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { marginTop: 10, color: '#94A3B8', fontWeight: '500' }
});