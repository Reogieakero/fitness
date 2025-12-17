import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Zap, ChevronRight } from 'lucide-react-native';
import { getAllWorkouts } from '../database/database';

export default function WorkoutHistory({ userId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = getAllWorkouts(userId);
    setHistory(data);
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Workout History</Text>
      {history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.workoutName}>{item.intensity} Session</Text>
                <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              </View>
              <Zap size={18} color="#6366F1" />
            </View>
          )}
        />
      ) : (
        <View style={styles.empty}><History size={48} color="#CBD5E1" /><Text>No workouts logged yet.</Text></View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  info: { flex: 1 },
  workoutName: { fontWeight: '700', fontSize: 16 },
  date: { color: '#94A3B8', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }
});