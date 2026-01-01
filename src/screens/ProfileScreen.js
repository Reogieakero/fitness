import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Modal, Platform, Image, Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { 
  User, Info, LogOut, Edit2, Save, ChevronRight, 
  ShieldCheck, Camera, Target, Scale, Ruler, 
  Calendar, Mail, Zap, Trophy, AlertCircle, CheckCircle2
} from 'lucide-react-native';
import { getFullUser, updateUserProfile, updateUserProfileImage } from '../database/database';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Abstract Background Component
const AbstractBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient
      colors={['#F0F4FF', '#FBFDFF', '#FFFFFF']}
      style={StyleSheet.absoluteFill}
    />
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
      <Circle cx={width * 0.9} cy={SCREEN_HEIGHT * 0.1} r="150" fill="#E0E7FF" opacity="0.4" />
      <Rect x="-50" y={SCREEN_HEIGHT * 0.4} width="200" height="200" rx="40" fill="#EEF2FF" transform="rotate(-15)" opacity="0.5" />
      <Circle cx={width * 0.1} cy={SCREEN_HEIGHT * 0.8} r="100" fill="#E0E7FF" opacity="0.3" />
    </Svg>
  </View>
);

export default function ProfileScreen({ userId, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Custom Alert State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' // 'success' or 'error'
  });

  const [profile, setProfile] = useState({
    username: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
    email: '',
    profileImage: null,
    level: 1,
    xp: 0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const showAlert = (title, message, type = 'success') => {
    setCustomAlert({ visible: true, title, message, type });
  };

  const loadProfile = () => {
    const data = getFullUser(userId);
    if (data) {
      setProfile({
        username: data.username,
        age: data.age?.toString() || '',
        weight: data.weight?.toString() || '',
        height: data.height?.toString() || '',
        fitnessGoal: data.fitnessGoal || '',
        email: data.email,
        profileImage: data.profileImage || null,
        level: data.level || 1,
        xp: data.xp || 0
      });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Access Denied', 'Camera roll permissions are required to update your avatar.', 'error');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setProfile({ ...profile, profileImage: selectedUri });
      updateUserProfileImage(userId, selectedUri);
    }
  };

  const handleSave = () => {
    try {
      updateUserProfile(userId, profile.username, profile.age, profile.weight, profile.height, profile.fitnessGoal);
      setIsEditing(false);
      showAlert("Success", "Profile Synced to Cloud.", "success");
    } catch (e) {
      showAlert("Error", "Update failed. Please check your connection.", "error");
    }
  };

  const StatItem = ({ label, value, icon: Icon, field, keyboardType }) => (
    <View style={styles.statBox}>
      <View style={styles.statHeader}>
        <Icon size={16} color="#64748B" />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={styles.statInput}
          value={value}
          onChangeText={(txt) => setProfile({ ...profile, [field]: txt })}
          keyboardType={keyboardType}
          placeholder="--"
          placeholderTextColor="#94A3B8"
        />
      ) : (
        <Text style={styles.statValue}>{value || '--'}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AbstractBackground />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Account</Text>
              <Text style={styles.subTitle}>Manage your hero stats</Text>
            </View>
            <TouchableOpacity 
              style={[styles.actionBtn, isEditing ? styles.saveActive : styles.editActive]} 
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? <Save color="#FFF" size={22} /> : <Edit2 color="#1E3A8A" size={22} />}
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
              <View style={styles.avatarRing}>
                {profile.profileImage ? (
                  <Image source={{ uri: profile.profileImage }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <User color="#94A3B8" size={50} />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Camera color="#FFF" size={16} />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.userNameText}>{profile.username || 'Hero'}</Text>
            <View style={styles.emailContainer}>
              <Mail size={14} color="#64748B" />
              <Text style={styles.userEmailText}>{profile.email}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.gridSection}>
            <View style={styles.row}>
              <StatItem label="Age" value={profile.age} icon={Calendar} field="age" keyboardType="numeric" />
              <StatItem label="Weight (kg)" value={profile.weight} icon={Scale} field="weight" keyboardType="numeric" />
            </View>
            <View style={styles.row}>
              <StatItem label="Height (cm)" value={profile.height} icon={Ruler} field="height" keyboardType="numeric" />
              <StatItem label="Total XP" value={profile.xp.toString()} icon={Zap} field="xp" keyboardType="numeric" />
            </View>
          </View>

          {/* Goal Section */}
          <View style={styles.goalCard}>
            <View style={styles.statHeader}>
              <Target size={18} color="#1E3A8A" />
              <Text style={styles.goalLabel}>ACTIVE MISSION</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.goalInput}
                value={profile.fitnessGoal}
                onChangeText={(txt) => setProfile({ ...profile, fitnessGoal: txt })}
                multiline
              />
            ) : (
              <Text style={styles.goalValue}>{profile.fitnessGoal || 'No active mission set.'}</Text>
            )}
          </View>

          {/* System Menu */}
          <Text style={styles.menuTitle}>SYSTEM SETTINGS</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowAbout(true)}>
              <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                <Info color="#4F46E5" size={20} />
              </View>
              <Text style={styles.menuText}>About KinetiQo</Text>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.noBorder]} onPress={onLogout}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFF1F2' }]}>
                <LogOut color="#E11D48" size={20} />
              </View>
              <Text style={[styles.menuText, { color: '#E11D48' }]}>Logout Session</Text>
              <ChevronRight color="#FECDD3" size={20} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* About Modal */}
      <Modal visible={showAbout} animationType="slide" transparent>
        <View style={styles.modalBlur}>
          <View style={styles.proModal}>
            <View style={styles.modalIndicator} />
            <Trophy color="#F59E0B" size={48} style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>KinetiQo RPG</Text>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutDesc}>
                Welcome to the ultimate gamified fitness experience. {"\n\n"}
                KinetiQo turns your daily grind into an epic adventure. Log your workouts to gain XP, complete missions to level up your real-life stats, and track your progress through our RPG-inspired interface.
              </Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>BUILD v1.2.0 - STABLE</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAbout(false)}>
              <Text style={styles.closeBtnText}>RETURN TO BASE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CUSTOM ALERT MODAL */}
      <Modal visible={customAlert.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconCircle, { backgroundColor: customAlert.type === 'success' ? '#ECFDF5' : '#FEF2F2' }]}>
                {customAlert.type === 'success' ? 
                  <CheckCircle2 color="#10B981" size={32} /> : 
                  <AlertCircle color="#EF4444" size={32} />
                }
            </View>
            <Text style={styles.alertTitle}>{customAlert.title}</Text>
            <Text style={styles.alertMessage}>{customAlert.message}</Text>
            <TouchableOpacity 
              style={[styles.alertButton, { backgroundColor: customAlert.type === 'success' ? '#10B981' : '#EF4444' }]} 
              onPress={() => setCustomAlert({ ...customAlert, visible: false })}
            >
              <Text style={styles.alertButtonText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFDFF' },
  scrollContent: { padding: 24, paddingTop: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 34, fontWeight: '900', color: '#0F172A' },
  subTitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  actionBtn: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  saveActive: { backgroundColor: '#10B981' },
  editActive: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },

  avatarContainer: { alignItems: 'center', marginBottom: 35 },
  avatarRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFF', elevation: 10, shadowColor: '#6366F1', shadowOpacity: 0.2, shadowRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 60 },
  placeholderAvatar: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  cameraIconContainer: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#4F46E5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  userNameText: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 15 },
  emailContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  userEmailText: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  gridSection: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  statInput: { fontSize: 18, fontWeight: '800', color: '#4F46E5', padding: 0, borderBottomWidth: 1, borderBottomColor: '#E0E7FF' },

  goalCard: { backgroundColor: 'rgba(248, 250, 255, 0.8)', padding: 20, borderRadius: 24, marginBottom: 30 },
  goalLabel: { fontSize: 11, fontWeight: '800', color: '#4F46E5', letterSpacing: 1 },
  goalValue: { fontSize: 15, fontWeight: '600', color: '#334155', marginTop: 10, lineHeight: 22 },
  goalInput: { fontSize: 15, fontWeight: '600', color: '#4F46E5', marginTop: 10, backgroundColor: '#FFF', borderRadius: 12, padding: 10 },

  menuTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 15, marginLeft: 4 },
  menuGroup: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  noBorder: { borderBottomWidth: 0 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },

  modalBlur: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  proModal: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, alignItems: 'center', paddingBottom: 40 },
  modalIndicator: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  aboutContent: { alignItems: 'center', width: '100%' },
  aboutDesc: { textAlign: 'center', color: '#475569', lineHeight: 24, fontSize: 15, marginBottom: 20 },
  versionBadge: { backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 25 },
  versionText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  closeBtn: { backgroundColor: '#4F46E5', width: '100%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 4 },
  closeBtnText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 },

  // Custom Alert Styles
  alertOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertBox: { width: '100%', maxWidth: 340, backgroundColor: '#FFF', borderRadius: 28, padding: 24, alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20 },
  alertIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  alertMessage: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  alertButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  alertButtonText: { color: '#FFF', fontWeight: '800', letterSpacing: 1.2, fontSize: 14 }
});