import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Modal, ScrollView, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, Clock, ChevronRight, 
  X, CheckCircle2, Activity, Flame, AlertCircle, CheckCircle, ImageIcon
} from 'lucide-react-native';
import { getAllWorkouts, getWorkoutStreak } from '../database/database';

export default function WorkoutsScreen({ userId }) {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    const workouts = getAllWorkouts(userId);
    setHistory(workouts);
    setStreak(getWorkoutStreak(userId));
  }, [userId]);

  const renderItem = ({ item }) => {
    const dateObj = new Date(item.timestamp);
    const intensityColor = item.intensity === 'Intense' ? '#EF4444' : item.intensity === 'Moderate' ? '#6366F1' : '#10B981';
    const isComplete = item.status === 'Complete';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setSelectedWorkout(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={styles.statusHeaderRow}>
            <View style={[styles.intensityPill, { backgroundColor: intensityColor + '15' }]}>
              <Text style={[styles.intensityText, { color: intensityColor }]}>{item.intensity}</Text>
            </View>
            
            <View style={[styles.statusPill, { backgroundColor: isComplete ? '#DCFCE7' : '#FEE2E2' }]}>
              {isComplete ? <CheckCircle size={10} color="#10B981" /> : <AlertCircle size={10} color="#EF4444" />}
              <Text style={[styles.statusPillText, { color: isComplete ? '#10B981' : '#EF4444' }]}>
                {item.status || 'Complete'}
              </Text>
            </View>

            {item.imageUri && (
              <View style={styles.photoIndicator}>
                <ImageIcon size={10} color="#64748B" />
              </View>
            )}
          </View>

          <Text style={styles.workoutTitle}>Workout Session</Text>
          <View style={styles.metaRow}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.metaText}>{dateObj.toLocaleDateString()}</Text>
            <Clock size={12} color="#94A3B8" style={{ marginLeft: 8 }} />
            <Text style={styles.metaText}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#CBD5E1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={styles.streakInfo}>
          <Flame size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.streakText}>{streak} Day Streak</Text>
        </View>
      </View>

      <FlatList 
        data={history} 
        renderItem={renderItem} 
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Activity size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No workouts logged yet.</Text>
          </View>
        }
      />

      <Modal 
        visible={!!selectedWorkout} 
        transparent 
        animationType="slide"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalLabel, { color: selectedWorkout?.status === 'Complete' ? '#10B981' : '#EF4444' }]}>
                    {selectedWorkout?.status?.toUpperCase() || 'SESSION'} SUMMARY
                </Text>
                <Text style={styles.modalTitle}>{selectedWorkout?.intensity} Routine</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedWorkout(null)} style={styles.closeBtn}>
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedWorkout?.imageUri && (
                <View style={styles.modalImageContainer}>
                  <Image source={{ uri: selectedWorkout.imageUri }} style={styles.modalImage} />
                  {/* Time Uploaded Badge */}
                  <View style={styles.timeBadge}>
                    <Clock size={10} color="#FFF" />
                    <Text style={styles.timeBadgeText}>
                      Uploaded {new Date(selectedWorkout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.exerciseHeading}>Exercises:</Text>
              {selectedWorkout?.details ? (
                selectedWorkout.details.split(', ').map((ex, i) => (
                  <View key={i} style={styles.exerciseRow}>
                    <CheckCircle2 size={18} color={selectedWorkout.status === 'Complete' ? "#10B981" : "#CBD5E1"} />
                    <Text style={styles.exerciseText}>{ex}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDetails}>No exercise details found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  streakText: { color: '#F59E0B', fontWeight: '700', fontSize: 14 },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#64748B', shadowOpacity: 0.05, shadowRadius: 8 },
  cardLeft: { flex: 1 },
  statusHeaderRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  intensityPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  intensityText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '900' },
  photoIndicator: { backgroundColor: '#F1F5F9', padding: 4, borderRadius: 6 },
  workoutTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, height: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  modalLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 14 },
  modalImageContainer: { width: '100%', height: 250, borderRadius: 24, overflow: 'hidden', marginBottom: 25, position: 'relative' },
  modalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  timeBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  exerciseHeading: { fontSize: 16, fontWeight: '800', color: '#334155', marginBottom: 15 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  exerciseText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  noDetails: { color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 10 },
  emptyText: { color: '#94A3B8', fontWeight: '600' }
});