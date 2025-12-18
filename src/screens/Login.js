import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Modal, Pressable, KeyboardAvoidingView, Platform, 
  ScrollView, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, BicepsFlexed, X } from 'lucide-react-native';
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BicepsFlexed color="#1E3A8A" size={40} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail color="#64748B" size={18} style={styles.icon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="you@example.com" 
                  placeholderTextColor="#64748B"
                  autoCapitalize="none" 
                  keyboardType="email-address"
                  value={email} 
                  onChangeText={setEmail} 
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#64748B" size={18} style={styles.icon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter password" 
                  secureTextEntry={!showPassword} 
                  value={password} 
                  onChangeText={setPassword} 
                />
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
              <TouchableOpacity onPress={onSwitchToSignUp}>
                <Text style={styles.linkAction}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* --- CUSTOM MODAL ALERT --- */}
        <Modal 
          animationType="fade" 
          transparent={true} 
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Close Icon for better UX */}
              <TouchableOpacity 
                style={styles.closeIcon} 
                onPress={() => setModalVisible(false)}
              >
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>

              <View style={[
                styles.modalIconBox, 
                { backgroundColor: modalType === 'success' ? '#ECFDF5' : '#FEF2F2' }
              ]}>
                {modalType === 'success' ? (
                  <CheckCircle2 color="#10B981" size={36} />
                ) : (
                  <AlertCircle color="#EF4444" size={36} />
                )}
              </View>

              <Text style={[
                styles.modalTitle, 
                { color: modalType === 'success' ? '#065F46' : '#991B1B' }
              ]}>
                {modalType === 'success' ? 'Success!' : 'Oops!'}
              </Text>

              <Text style={styles.modalBody}>{modalMsg}</Text>

              <Pressable 
                style={({ pressed }) => [
                  styles.modalBtn, 
                  { 
                    backgroundColor: modalType === 'success' ? '#1E3A8A' : '#EF4444',
                    opacity: pressed ? 0.8 : 1
                  }
                ]} 
                onPress={() => {
                  setModalVisible(false);
                  if (modalType === 'success') onLoginSuccess(userBuffer); 
                }}
              >
                <Text style={styles.modalBtnText}>
                  {modalType === 'success' ? 'Continue' : 'Try Again'}
                </Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  header: { marginBottom: 32, alignItems: 'center' },
  iconContainer: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 22, 
    elevation: 8, 
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16 
  },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 4 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 4 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 60, 
    borderWidth: 1.5, 
    borderColor: '#F1F5F9',
    // shadow for inputs
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  btnPrimary: { 
    backgroundColor: '#1E3A8A', 
    height: 60, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 12, 
    elevation: 4,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: '#64748B', fontSize: 15 },
  linkAction: { color: '#1E3A8A', fontSize: 15, fontWeight: '800' },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width * 0.85, 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 24, 
    alignItems: 'center',
    position: 'relative',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  closeIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 4,
  },
  modalIconBox: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  modalBody: { 
    textAlign: 'center', 
    fontSize: 16, 
    lineHeight: 22, 
    color: '#64748B', 
    marginBottom: 28,
    paddingHorizontal: 10
  },
  modalBtn: { 
    width: '100%', 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  modalBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});