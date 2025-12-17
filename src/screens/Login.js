import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Modal, Pressable, KeyboardAvoidingView, Platform, 
  ScrollView, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, BicepsFlexed } from 'lucide-react-native';
import { loginUser } from '../database/database';

const { width, height } = Dimensions.get('window');

export default function Login({ onSwitchToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success'); 
  const [modalMsg, setModalMsg] = useState('');
  const [userBuffer, setUserBuffer] = useState(null); // Holds user data until modal is dismissed

  const showAlert = (type, message) => {
    setModalType(type);
    setModalMsg(message);
    setModalVisible(true);
  };

  const handleLogin = () => {
    if (!email || !password) {
      showAlert('error', 'Please enter both email and password.');
      return;
    }

    try {
      const user = loginUser(email, password);
      if (user) {
        setUserBuffer(user); // Store found user
        showAlert('success', `Welcome back, ${user.username}!`);
      } else {
        showAlert('error', 'Invalid email or password.');
      }
    } catch (error) {
      showAlert('error', 'Database connection error.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}><BicepsFlexed color="#1E3A8A" size={40} /></View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail color="#64748B" size={18} style={styles.icon} />
                <TextInput style={styles.input} placeholder="you@example.com" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#64748B" size={18} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Enter password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff color="#1E3A8A" size={20} /> : <Eye color="#94A3B8" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onSwitchToSignUp}><Text style={styles.linkAction}>Sign Up</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.modalIconBox, { backgroundColor: modalType === 'success' ? '#ECFDF5' : '#FEF2F2' }]}>
                {modalType === 'success' ? <CheckCircle2 color="#10B981" size={32} /> : <AlertCircle color="#EF4444" size={32} />}
              </View>
              <Text style={styles.modalTitle}>{modalType === 'success' ? 'Success!' : 'Error'}</Text>
              <Text style={styles.modalBody}>{modalMsg}</Text>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: modalType === 'success' ? '#1E3A8A' : '#EF4444' }]} 
                onPress={() => {
                  setModalVisible(false);
                  if (modalType === 'success') onLoginSuccess(userBuffer); 
                }}
              >
                <Text style={styles.modalBtnText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { marginBottom: 32, alignItems: 'center' },
  iconContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, elevation: 4, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  form: { gap: 16 },
  inputContainer: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E2E8F0' },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  btnPrimary: { backgroundColor: '#1E3A8A', height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  linkText: { color: '#64748B', fontSize: 15 },
  linkAction: { color: '#1E3A8A', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 32, alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { textAlign: 'center', marginVertical: 8, color: '#64748B' },
  modalBtn: { width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold' }
});