import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './src/database/database';
import SignUp from './src/screens/SignUp';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import NutritionScreen from './src/screens/NutritionScreen'; 
import NavBar from './src/components/Navbar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeTab, setActiveTab] = useState('Home');
  const [userData, setUserData] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const handleLoginSuccess = (userFromDb) => {
    if (!userFromDb) return;
    const fullName = userFromDb.username || 'Hero';
    const firstName = fullName.trim().split(' ')[0];

    setUserData({
      id: userFromDb.id,
      firstName: firstName,
      xp: userFromDb.xp || 0,
      level: userFromDb.level || 1,
      streak: userFromDb.streak || 0,
      workoutsToday: userFromDb.workoutsToday || 0,
      caloriesLogged: userFromDb.caloriesLogged || 0,
      achievementsCount: userFromDb.achievementsCount || 1, 
    });
    
    setCurrentScreen('MainApp');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('Login');
    setActiveTab('Home');
    setIsWorkoutActive(false);
  };

  const startWorkoutSession = (workoutData) => {
    setActiveWorkoutData(workoutData);
    setIsWorkoutActive(true);
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

  if (isWorkoutActive && activeWorkoutData) {
    return (
      <SafeAreaProvider>
        <WorkoutScreen 
          workoutData={activeWorkoutData}
          userId={userData?.id}
          userStats={userData}
          onComplete={() => {
            setIsWorkoutActive(false);
            setActiveWorkoutData(null);
          }}
        />
      </SafeAreaProvider>
    );
  }

  // --- LOADING GUARD ---
  // If we are in MainApp but userData hasn't loaded, show a loader
  if (!userData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          {activeTab === 'Home' && (
            <Home user={userData} onWorkoutStart={startWorkoutSession} />
          )}

          {activeTab === 'Workouts' && (
            <WorkoutsScreen userId={userData.id} />
          )}

          {activeTab === 'Nutrition' && (
            <NutritionScreen userId={userData.id} />
          )}

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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { flex: 1, backgroundColor: '#FFF' },
  profileContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});