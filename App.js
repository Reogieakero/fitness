import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './src/database/database';
import SignUp from './src/screens/SignUp';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import NavBar from './src/components/Navbar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeTab, setActiveTab] = useState('Home');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    initDatabase();
  }, []);

 const handleLoginSuccess = (userFromDb) => {
  if (!userFromDb) return;

  const fullName = userFromDb.username || 'Hero';
  const firstPart = fullName.trim().split(' ')[0];
  const firstName = firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();

  setUserData({
    firstName: firstName,
    xp: userFromDb.xp || 0,
    level: userFromDb.level || 1,
    streak: userFromDb.streak || 0,
    workoutsToday: userFromDb.workoutsToday || 0,
    caloriesLogged: userFromDb.caloriesLogged || 0,
    // ENSURE THIS IS AT LEAST 1 FOR NEW USERS
    achievementsCount: userFromDb.achievementsCount || 1, 
  });
  
  setCurrentScreen('MainApp');
};

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('Login');
    setActiveTab('Home');
  };

  if (currentScreen === 'Login') {
    return (
      <SafeAreaProvider>
        <Login onSwitchToSignUp={() => setCurrentScreen('SignUp')} onLoginSuccess={handleLoginSuccess} />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'SignUp') {
    return (
      <SafeAreaProvider>
        <SignUp onSwitchToLogin={() => setCurrentScreen('Login')} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          {activeTab === 'Home' && <Home user={userData} />}
          {activeTab === 'Workouts' && <View style={styles.placeholder} />}
          {activeTab === 'Stats' && <View style={styles.placeholder} />}
          {activeTab === 'Profile' && (
            <View style={styles.profileContainer}>
              <Button title="Logout" onPress={handleLogout} color="#EF4444" />
            </View>
          )}
        </View>
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: '#FFF' },
  profileContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});