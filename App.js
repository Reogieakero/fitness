import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Database and Screen Imports
import { initDatabase } from './src/database/database';
import SignUp from './src/screens/SignUp';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import NutritionScreen from './src/screens/NutritionScreen'; 
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // New Profile Screen
import NavBar from './src/components/Navbar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeTab, setActiveTab] = useState('Home');
  const [userData, setUserData] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);

  // Initialize SQLite Database on mount
  useEffect(() => {
    initDatabase();
  }, []);

  /**
   * Handles user data setup after successful authentication
   */
  const handleLoginSuccess = (userFromDb) => {
    if (!userFromDb) return;
    
    // Extract first name for the "Hero" greeting in Home.js
    const fullName = userFromDb.username || userFromDb.firstName || 'Hero';
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

  /**
   * Resets app state for logout
   */
  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('Login');
    setActiveTab('Home');
    setIsWorkoutActive(false);
  };

  /**
   * Transitions to the active workout session overlay
   */
  const startWorkoutSession = (workoutData) => {
    setActiveWorkoutData(workoutData);
    setIsWorkoutActive(true);
  };

  // --- CONDITIONAL RENDERING ---

  // 1. Auth Flow: Login
  if (currentScreen === 'Login') {
    return (
      <SafeAreaProvider>
        <Login 
          onSwitchToSignUp={() => setCurrentScreen('SignUp')} 
          onLoginSuccess={handleLoginSuccess} 
        />
      </SafeAreaProvider>
    );
  }

  // 2. Auth Flow: Sign Up
  if (currentScreen === 'SignUp') {
    return (
      <SafeAreaProvider>
        <SignUp onSwitchToLogin={() => setCurrentScreen('Login')} />
      </SafeAreaProvider>
    );
  }

  // 3. Active Workout Overlay (Takes over the full screen)
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

  // 4. Loading State
  if (!userData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  // 5. Main Application Flow (With Bottom Navbar)
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          
          {activeTab === 'Home' && (
            <Home 
              user={userData} 
              onWorkoutStart={startWorkoutSession} 
            />
          )}

          {activeTab === 'Workouts' && (
            <WorkoutsScreen userId={userData.id} />
          )}

          {activeTab === 'Nutrition' && (
            <NutritionScreen userId={userData.id} />
          )}

          {activeTab === 'Stats' && (
            <StatsScreen userId={userData.id} />
          )}

          {activeTab === 'Profile' && (
            <ProfileScreen 
              userId={userData.id} 
              onLogout={handleLogout} 
            />
          )}
          
        </View>

        {/* Persistent Navigation Bar */}
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  content: { 
    flex: 1 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  }
});