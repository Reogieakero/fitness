import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Modal, ScrollView, Image, Animated, Easing, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, Clock, X, CheckCircle2, Flame, AlertCircle, 
  Image as ImageIcon, Dumbbell, History, Trophy
} from 'lucide-react-native';
import { getAllWorkouts, getWorkoutStreak } from '../database/database';

const { width, height } = Dimensions.get('window');

const BackgroundShapes = () => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const getBlobStyle = (xRange, yRange, scaleRange, reverse = false) => {
    return {
      transform: [
        {
          translateX: moveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: xRange,
          }),
        },
        {
          translateY: moveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: yRange,
          }),
        },
        {
          scale: moveAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: scaleRange,
          }),
        },
        {
          rotate: moveAnim.interpolate({
            inputRange: [0, 1],
            outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
          }),
        },
      ],
    };
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View 
        style={[
          styles.blob, 
          { top: -40, right: -60, backgroundColor: '#E0E7FF' },
          getBlobStyle([0, 60, 0], [0, 40, 0], [1, 1.3, 1])
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          { bottom: 40, left: -80, backgroundColor: '#F0F9FF', width: 350, height: 350 },
          getBlobStyle([0, -50, 0], [0, 100, 0], [1, 0.8, 1], true)
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          { top: height * 0.35, right: -120, width: 280, height: 280, backgroundColor: '#F5F3FF', opacity: 0.5 },
          getBlobStyle([-30, 30, -30], [50, -50, 50], [0.9, 1.1, 0.9])
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          { top: height * 0.6, left: -50, width: 180, height: 180, backgroundColor: '#EEF2FF', opacity: 0.4 },
          getBlobStyle([20, -40, 20], [30, 0, 30], [1, 1.2, 1], true)
        ]} 
      />
    </View>
  );
};

export default function WorkoutsScreen({ user, userId }) {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const workouts = getAllWorkouts(userId || user?.id);
    setHistory(workouts);
    setStreak(getWorkoutStreak(userId || user?.id));
  }, [userId, user?.id]);

  const openDetails = (workout) => {
    setSelectedWorkout(workout);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeDetails = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setSelectedWorkout(null);
    });
  };

  const modalStyle = {
    opacity: modalAnim,
    transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }]
  };

  const renderItem = ({ item }) => {
    const dateObj = new Date(item.timestamp);
    const intensityColor = item.intensity === 'Intense' ? '#EF4444' : item.intensity === 'Moderate' ? '#6366F1' : '#10B981';
    const isComplete = item.status === 'Complete';

    return (
      <TouchableOpacity 
        style={[styles.cardBase, styles.proWorkoutCard]} 
        onPress={() => openDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.proCardContent}>
          <View style={styles.proHeaderRow}>
            <View style={[styles.intensityPill, { backgroundColor: intensityColor + '15' }]}>
              <View style={[styles.intensityDot, { backgroundColor: intensityColor }]} />
              <Text style={[styles.intensityText, { color: intensityColor }]}>{item.intensity.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.proWorkoutTitle} numberOfLines={1}>Training Session</Text>
          
          <View style={styles.proMetaRow}>
            <View style={styles.metaItem}>
               <Calendar size={12} color="#64748B" />
               <Text style={styles.metaText}>{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.proSeparator} />
            <View style={styles.metaItem}>
               <Clock size={12} color="#64748B" />
               <Text style={styles.metaText}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardImageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.cardThumb} />
          ) : (
            <View style={[styles.cardThumbPlaceholder, { backgroundColor: intensityColor + '10' }]}>
               <Dumbbell size={24} color={intensityColor} opacity={0.3} />
            </View>
          )}
          <View style={[styles.miniStatusBadge, { backgroundColor: isComplete ? '#10B981' : '#EF4444' }]}>
             {isComplete ? <Trophy size={10} color="#FFF" /> : <AlertCircle size={10} color="#FFF" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <BackgroundShapes />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>MISSION LOGS</Text>
            <Text style={styles.title}>History</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        <FlatList 
          data={history} 
          renderItem={renderItem} 
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <History size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No missions recorded in the archives.</Text>
            </View>
          }
        />

        <Modal visible={!!selectedWorkout} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, styles.polishedModal, { height: '85%' }, modalStyle]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalLabel, { color: selectedWorkout?.status === 'Complete' ? '#10B981' : '#EF4444' }]}>
                      {selectedWorkout?.status === 'Complete' ? 'MISSION DEBRIEF' : 'INCOMPLETE LOG'}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedWorkout?.intensity} Session</Text>
                </View>
                <TouchableOpacity onPress={closeDetails} style={styles.closeBtn}>
                  <X size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                {selectedWorkout?.imageUri && (
                  <View style={styles.modalImageContainer}>
                    <Image source={{ uri: selectedWorkout.imageUri }} style={styles.modalImage} />
                    <View style={styles.timeBadge}>
                      <Clock size={10} color="#FFF" />
                      <Text style={styles.timeBadgeText}>
                        LOGGED AT {new Date(selectedWorkout.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.sectionHeader}>
                  <Dumbbell size={18} color="#1E3A8A" />
                  <Text style={styles.exerciseHeading}>Exercise Protocol</Text>
                </View>

                {selectedWorkout?.details ? (
                  selectedWorkout.details.split(', ').map((ex, i) => (
                    <View key={i} style={styles.exerciseRow}>
                      <View style={styles.exerciseIndexBox}>
                          <Text style={styles.exerciseIndex}>{i + 1}</Text>
                      </View>
                      <Text style={styles.exerciseText}>{ex}</Text>
                      {selectedWorkout.status === 'Complete' && <CheckCircle2 size={18} color="#10B981" />}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                      <Text style={styles.noDetails}>No tactical data available for this session.</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.returnBtn} onPress={closeDetails}>
                      <Text style={styles.returnBtnText}>RETURN TO ARCHIVES</Text>
                  </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFDFF' },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  streakText: { marginLeft: 6, fontWeight: '800', fontSize: 16, color: '#0F172A' },
  listContainer: { padding: 20, paddingBottom: 100 },
  cardBase: { backgroundColor: 'transparent', borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(226, 232, 240, 0.6)' },
  proWorkoutCard: { padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  proCardContent: { flex: 1, paddingRight: 16, justifyContent: 'center' },
  cardImageContainer: { width: 85, height: 85, borderRadius: 18, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  cardThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardThumbPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  miniStatusBadge: { position: 'absolute', bottom: 6, right: 6, padding: 4, borderRadius: 8, elevation: 2 },
  proHeaderRow: { flexDirection: 'row', marginBottom: 4 },
  intensityPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  intensityDot: { width: 4, height: 4, borderRadius: 2, marginRight: 6 },
  intensityText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  proWorkoutTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  proMetaRow: { flexDirection: 'row', alignItems: 'center' },
  proSeparator: { width: 1, height: 10, backgroundColor: 'rgba(148, 163, 184, 0.3)', marginHorizontal: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 32, width: '100%', maxWidth: 450, overflow: 'hidden' },
  polishedModal: { paddingHorizontal: 0 },
  modalHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 14 },
  modalImageContainer: { width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 24 },
  modalImage: { width: '100%', height: '100%' },
  timeBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  exerciseHeading: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 10 },
  exerciseIndexBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  exerciseIndex: { fontSize: 10, fontWeight: '900', color: '#1E3A8A' },
  exerciseText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#334155' },
  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  returnBtn: { backgroundColor: '#1E3A8A', padding: 18, borderRadius: 20, alignItems: 'center' },
  returnBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 15 },
  emptyText: { color: '#94A3B8', fontWeight: '700', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 }
});