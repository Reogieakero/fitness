import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Home, Dumbbell, BarChart2, User, Beef } from 'lucide-react-native'; // Added Utensils

export default function NavBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'Home', icon: Home },
    { id: 'Workouts', icon: Dumbbell },
    { id: 'Nutrition', icon: Beef }, // New Tab
    { id: 'Stats', icon: BarChart2 },
    { id: 'Profile', icon: User },
  ];

  return (
    <View style={styles.navWrapper}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabItem}
            >
              <Icon 
                size={24} 
                color={isActive ? '#1E3A8A' : '#94A3B8'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  navBar: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    width: '90%', // Increased width from 85% to 90% to accommodate the 5th icon
    height: 70, 
    borderRadius: 35, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 20,
    paddingHorizontal: 15, // Adjusted padding
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 }, // Added flex: 1 for equal spacing
  activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#1E3A8A', marginTop: 4 }
});