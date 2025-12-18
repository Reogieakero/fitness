import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Animated, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { 
  X, Play, Pause, SkipForward, 
  Dumbbell, CheckCircle, ArrowRight, AlertCircle, Camera, Image as ImageIcon
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { logWorkout, updateUserStatsInDB } from '../database/database';

const { height } = Dimensions.get('window');

export default function WorkoutScreen({ workoutData, onComplete, userId, userStats }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('READY'); 
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [finalStatus, setFinalStatus] = useState(null); 
  const [selectedImage, setSelectedImage] = useState(null);
  
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && phase !== 'FINISHED') {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase !== 'FINISHED') {
      handlePhaseTransition();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  useEffect(() => {
    if (phase === 'FINISHED') return;
    let duration = phase === 'READY' ? 5000 : phase === 'PERFORM' ? 30000 : 15000;

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [phase, currentIndex]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePhaseTransition = () => {
    if (phase === 'READY') {
      setPhase('PERFORM');
      setTimeLeft(30);
    } else if (phase === 'PERFORM') {
      if (currentIndex === workoutData.exercises.length - 1) {
        finalizeWorkout(true);
      } else {
        setPhase('REST');
        setTimeLeft(15);
      }
    } else if (phase === 'REST') {
      setCurrentIndex(prev => prev + 1);
      setPhase('READY');
      setTimeLeft(5);
    }
  };

  const finalizeWorkout = (isComplete) => {
    if (phase === 'FINISHED') return; 

    const statusText = isComplete ? 'Complete' : 'Incomplete';
    setFinalStatus(statusText);
    setPhase('FINISHED');
    setIsActive(false);
  };

  const handleFinishAndSave = () => {
    const isComplete = finalStatus === 'Complete';
    
    // Extract names only for database logging to prevent Object error in database
    const exerciseNames = workoutData.exercises.map(ex => ex.name).join(', ');

    logWorkout(
        userId, 
        workoutData.level, 
        isComplete ? workoutData.xp : 0, 
        exerciseNames, 
        finalStatus,
        selectedImage
    );
    
    if (isComplete) {
      let newXp = userStats.xp + workoutData.xp;
      let newLevel = userStats.level;
      if (newXp >= 100) {
        newLevel += 1;
        newXp -= 100;
      }
      updateUserStatsInDB(userId, newXp, newLevel);
    }
    onComplete();
  };

  const getPhaseColor = () => {
    if (phase === 'READY') return '#F59E0B';
    if (phase === 'PERFORM') return '#10B981';
    if (phase === 'REST') return '#6366F1';
    return '#1E3A8A';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const currentExercise = workoutData.exercises[currentIndex];

  if (phase === 'FINISHED') {
    const success = finalStatus === 'Complete';
    return (
      <View style={styles.container}>
        <View style={styles.finishedContent}>
          {success ? <CheckCircle color="#10B981" size={60} /> : <AlertCircle color="#EF4444" size={60} />}
          <Text style={styles.finishedTitle}>{success ? 'Workout Complete!' : 'Session Skipped'}</Text>
          <Text style={styles.xpText}>{success ? `+${workoutData.xp} XP Earned` : 'Marked as Incomplete'}</Text>
          
          <View style={styles.imageUploadSection}>
            <Text style={styles.uploadLabel}>Add a proof photo (Optional)</Text>
            {selectedImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
                  <X color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                  <Camera color="#1E3A8A" size={24} />
                  <Text style={styles.uploadBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                  <ImageIcon color="#1E3A8A" size={24} />
                  <Text style={styles.uploadBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={handleFinishAndSave}>
            <Text style={styles.doneBtnText}>Finish & Save</Text>
            <ArrowRight color="#FFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onComplete}>
          <X color="#0F172A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workoutData.level} Session</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth, backgroundColor: getPhaseColor() }]} />
        </View>
        <Text style={styles.exerciseCounter}>Exercise {currentIndex + 1} of {workoutData.exercises.length}</Text>
      </View>

      <View style={styles.mainDisplay}>
        <View style={styles.infoBox}>
          <Text style={[styles.phaseTag, { color: getPhaseColor() }]}>{phase}</Text>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        </View>
        
        {phase !== 'REST' && (
           <Image 
            source={currentExercise.gif} 
            style={styles.exerciseGif} 
            resizeMode="contain" 
           />
        )}
        
        <View style={[styles.timerCircle, { borderColor: getPhaseColor() }]}>
          <Text style={[styles.timerText, { color: getPhaseColor() }]}>{timeLeft}</Text>
          <Text style={styles.timerSub}>SEC</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.pauseBtn} onPress={() => setIsActive(!isActive)}>
          {isActive ? <Pause color="#1E3A8A" size={32} fill="#1E3A8A" /> : <Play color="#1E3A8A" size={32} fill="#1E3A8A" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => finalizeWorkout(false)}>
          <SkipForward color="#64748B" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.nextUpCard}>
        <View style={styles.nextHeader}>
          <Dumbbell color="#94A3B8" size={16} />
          <Text style={styles.nextLabel}>UP NEXT</Text>
        </View>
        <Text style={styles.nextName}>
          {currentIndex < workoutData.exercises.length - 1 
            ? workoutData.exercises[currentIndex + 1].name 
            : "Finish Mission"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  progressSection: { paddingHorizontal: 20, marginBottom: 10 },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  exerciseCounter: { textAlign: 'center', marginTop: 10, fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  
  mainDisplay: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'space-between', // Spreads elements to prevent overlap
    paddingVertical: 20 
  },
  infoBox: { alignItems: 'center' },
  phaseTag: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
  exerciseName: { fontSize: 26, fontWeight: '900', color: '#0F172A', textAlign: 'center', paddingHorizontal: 25 },
  
  exerciseGif: { 
    width: 200, 
    height: 140, // Height capped to ensure space for timer
    borderRadius: 20 
  },
  
  timerCircle: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF' 
  },
  timerText: { fontSize: 50, fontWeight: '900' },
  timerSub: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginTop: -5 },
  
  controls: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 20, 
    paddingBottom: 20,
    marginTop: 10
  },
  pauseBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  skipBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  
  nextUpCard: { 
    backgroundColor: '#F8FAFC', 
    padding: 20, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingBottom: height * 0.1 
  },
  nextHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  nextLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8' },
  nextName: { fontSize: 16, fontWeight: '800', color: '#334155' },
  
  finishedContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  finishedTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 15 },
  xpText: { fontSize: 16, color: '#64748B', fontWeight: '700', marginBottom: 25 },
  imageUploadSection: { width: '100%', alignItems: 'center', marginBottom: 30 },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 15 },
  uploadButtons: { flexDirection: 'row', gap: 15 },
  uploadBtn: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 20, alignItems: 'center', width: 100, borderWidth: 1, borderColor: '#DBEAFE' },
  uploadBtnText: { fontSize: 12, fontWeight: '800', color: '#1E3A8A', marginTop: 5 },
  previewContainer: { position: 'relative' },
  previewImage: { width: 200, height: 150, borderRadius: 20 },
  removeImage: { position: 'absolute', top: -10, right: -10, backgroundColor: '#EF4444', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1E3A8A', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 24 },
  doneBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});