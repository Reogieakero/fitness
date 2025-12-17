import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Mail, Lock, BicepsFlexed, Scale, Ruler, Eye, EyeOff 
} from 'lucide-react-native';
import { registerUser } from '../database/database';

const SelectionChip = ({ label, isSelected, onPress, style }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.chip, isSelected && styles.chipSelected, style]}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

export default function SignUp({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    age: '', weight: '', height: '',
    fitnessLevel: 'Beginner',
    fitnessGoal: 'Get Fit'
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSignUp = () => {
    const { username, email, password, confirmPassword, age, weight, height, fitnessLevel, fitnessGoal } = formData;
    
    if (!username || !email || !password || !age || !weight || !height) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Save data to SQLite
      registerUser(username, email, password, age, weight, height, fitnessLevel, fitnessGoal);
      
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => onSwitchToLogin() }
      ]);
    } catch (error) {
      Alert.alert("Error", "This email is already registered or database error.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.iconContainer}><BicepsFlexed color="#1E3A8A" size={35} /></View>
            <Text style={styles.title}>Start your fitness journey today</Text>
          </View>

          <View style={styles.form}>
            <InputBox icon={<User color="#64748B" size={18}/>} placeholder="Full Name" value={formData.username} onChangeText={(v) => updateField('username', v)} />
            <InputBox icon={<Mail color="#64748B" size={18}/>} placeholder="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} autoCapitalize="none" />
            <InputBox icon={<Lock color="#64748B" size={18}/>} placeholder="Password" value={formData.password} onChangeText={(v) => updateField('password', v)} secureTextEntry={!showPassword} isPassword setShow={setShowPassword} show={showPassword} />
            <InputBox icon={<Lock color="#64748B" size={18}/>} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)} secureTextEntry={true} />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <InputBox icon={<User color="#64748B" size={18}/>} placeholder="Age" value={formData.age} onChangeText={(v) => updateField('age', v)} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <InputBox icon={<Scale color="#64748B" size={18}/>} placeholder="Weight (kg)" value={formData.weight} onChangeText={(v) => updateField('weight', v)} keyboardType="numeric" />
              </View>
            </View>

            <InputBox icon={<Ruler color="#64748B" size={18}/>} placeholder="Height (cm)" value={formData.height} onChangeText={(v) => updateField('height', v)} keyboardType="numeric" />

            <Text style={styles.sectionLabel}>Fitness Level</Text>
            <View style={styles.chipRow}>
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <SelectionChip 
                  key={level} 
                  label={level} 
                  isSelected={formData.fitnessLevel === level} 
                  onPress={() => updateField('fitnessLevel', level)} 
                  style={{ flex: 1, alignItems: 'center' }} 
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Fitness Goal</Text>
            <View style={styles.chipGroup}>
              {['Lose Weight', 'Gain Muscle', 'Get Fit', 'Maintain'].map(goal => (
                <SelectionChip 
                  key={goal} 
                  label={goal} 
                  isSelected={formData.fitnessGoal === goal} 
                  onPress={() => updateField('fitnessGoal', goal)} 
                />
              ))}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSignUp}>
              <Text style={styles.btnText}>Start Journey</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSwitchToLogin} style={styles.loginLink}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAction}>Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputBox = ({ icon, isPassword, setShow, show, ...props }) => (
  <View style={styles.inputWrapper}>
    {icon}
    <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    {isPassword && (
      <TouchableOpacity onPress={() => setShow(!show)}>
        {show ? <EyeOff color="#1E3A8A" size={20} /> : <Eye color="#94A3B8" size={20} />}
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  iconContainer: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#334155', textAlign: 'center' },
  form: { gap: 12 },
  row: { flexDirection: 'row' },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 12, paddingHorizontal: 16, height: 52, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 10 },
  chipRow: { flexDirection: 'row', gap: 2 }, 
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { 
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, 
    backgroundColor: '#FFF', borderColor: '#E2E8F0', borderWidth: 1 
  },
  chipSelected: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  chipTextSelected: { color: '#FFF' },
  btnPrimary: { 
    backgroundColor: '#1E3A8A', height: 56, borderRadius: 14, 
    alignItems: 'center', justifyContent: 'center', marginTop: 20 
  },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  loginLink: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#64748B' },
  linkAction: { color: '#1E3A8A', fontWeight: '700' }
});