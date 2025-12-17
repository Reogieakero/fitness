import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/database/database';
import SignUp from './src/screens/SignUp';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import NavBar from './src/components/Navbar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    initDatabase();
  }, []);

  const handleLogout = () => {
    setCurrentScreen('Login');
    setActiveTab('Home');
  };

  // 1. Login View
  if (currentScreen === 'Login') {
    return (
      <SafeAreaProvider>
        <Login 
          onSwitchToSignUp={() => setCurrentScreen('SignUp')} 
          onLoginSuccess={() => setCurrentScreen('MainApp')} 
        />
      </SafeAreaProvider>
    );
  }

  // 2. Sign Up View
  if (currentScreen === 'SignUp') {
    return (
      <SafeAreaProvider>
        <SignUp onSwitchToLogin={() => setCurrentScreen('Login')} />
      </SafeAreaProvider>
    );
  }

  // 3. Main Application View (After Login)
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {activeTab === 'Home' && <Home />}
        
        {/* Placeholder for Workouts/Stats */}
        {activeTab === 'Workouts' && <View style={{flex:1, backgroundColor:'white'}} />}
        {activeTab === 'Stats' && <View style={{flex:1, backgroundColor:'white'}} />}
        
        {/* Profile Tab with Logout button to test functionality */}
        {activeTab === 'Profile' && (
          <View style={{flex:1, backgroundColor:'white', justifyContent:'center', alignItems:'center'}}>
            <Button title="Logout" onPress={handleLogout} color="#EF4444" />
          </View>
        )}

        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}