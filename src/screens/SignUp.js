import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Dimensions, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Mail, Lock, BicepsFlexed, Scale, Ruler, Eye, EyeOff, CircleAlert, CircleCheck 
} from 'lucide-react-native';
import { registerUser } from '../database/database';

// Custom Alert Component
const CustomAlert = ({ visible, title, message, type, onClose, onConfirm }) => {
  if (!visible) return null;
  
  const isSuccess = type === 'success';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          <View style={[styles.alertIconBg, { backgroundColor: isSuccess ? '#DCFCE7' : '#FEE2E2' }]}>
            {isSuccess ? (
              <CircleCheck color="#166534" size={32} />
            ) : (
              <CircleAlert color="#991B1B" size={32} />
            )}
          </View>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity 
            style={[styles.alertBtn, { backgroundColor: isSuccess ? '#166534' : '#1E3A8A' }]} 
            onPress={() => {
              onClose();
              if (onConfirm) onConfirm();
            }}
          >
            <Text style={styles.alertBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SelectionChip = ({ label, isSelected, onPress, style }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.chip, isSelected && styles.chipSelected, style]}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const InputBox = ({ icon, isPassword, setShow, show, error, ...props }) => (
  <View style={styles.inputContainer}>
    <View style={[styles.inputWrapper, error && { borderColor: '#EF4444' }]}>
      {icon}
      <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
      {isPassword && (
        <TouchableOpacity onPress={() => setShow(!show)}>
          {show ? <EyeOff color="#1E3A8A" size={20} /> : <Eye color="#94A3B8" size={20} />}
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export default function SignUp({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    age: '', weight: '', height: '',
    fitnessLevel: 'Beginner',
    fitnessGoal: 'Get Fit'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false, title: '', message: '', type: 'error', onConfirm: null
  });

  const showAlert = (title, message, type = 'error', onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  // Real-time password validation logic
  const validatePassword = (pass) => {
    if (!pass) return '';
    if (pass.length < 8) return 'Minimum 8 characters required';
    if (!/[A-Z]/.test(pass)) return 'Must include an uppercase letter';
    if (!/[a-z]/.test(pass)) return 'Must include a lowercase letter';
    if (!/\d/.test(pass)) return 'Must include a number';
    if (!/[@$!%*?&]/.test(pass)) return 'Must include a special character (@$!%*?&)';
    return '';
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSignUp = () => {
    const { username, email, password, confirmPassword, age, weight, height, fitnessLevel, fitnessGoal } = formData;
    
    if (!username || !email || !password || !confirmPassword || !age || !weight || !height) {
      showAlert("Required Fields", "Please fill in all details to create your profile.");
      return;
    }

    // Final check before submission
    const error = validatePassword(password);
    if (error) {
      showAlert("Weak Password", error);
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Mismatch", "The passwords you entered do not match.");
      return;
    }

    try {
      registerUser(username, email, password, age, weight, height, fitnessLevel, fitnessGoal);
      showAlert(
        "Welcome!", 
        "Account created successfully! Let's get started with your login.", 
        "success",
        () => onSwitchToLogin()
      );
    } catch (error) {
      showAlert("Error", "This email is already registered or a database error occurred.");
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
            
            <InputBox 
              icon={<Lock color="#64748B" size={18}/>} 
              placeholder="Password" 
              value={formData.password} 
              onChangeText={(v) => updateField('password', v)} 
              secureTextEntry={!showPassword} 
              isPassword={true} 
              setShow={setShowPassword} 
              show={showPassword} 
              error={passwordError}
            />

            <InputBox 
              icon={<Lock color="#64748B" size={18}/>} 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChangeText={(v) => updateField('confirmPassword', v)} 
              secureTextEntry={!showConfirmPassword} 
              isPassword={true} 
              setShow={setShowConfirmPassword} 
              show={showConfirmPassword} 
            />

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

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={alertConfig.onConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  iconContainer: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#334155', textAlign: 'center' },
  form: { gap: 12 },
  row: { flexDirection: 'row' },
  inputContainer: { marginBottom: 4 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 12, paddingHorizontal: 16, height: 52, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '600' },
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
  linkAction: { color: '#1E3A8A', fontWeight: '700' },
  
  alertOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  alertContainer: { 
    width: '80%', backgroundColor: '#FFF', borderRadius: 24, 
    padding: 24, alignItems: 'center', elevation: 10 
  },
  alertIconBg: { padding: 16, borderRadius: 50, marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  alertMessage: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  alertBtn: { width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});