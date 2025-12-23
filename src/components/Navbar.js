import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Home, Dumbbell, BarChart2, User, Beef } from 'lucide-react-native';

export default function NavBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Workouts', icon: Dumbbell, label: 'Work' },
    { id: 'Nutrition', icon: Beef, label: 'Eat' },
    { id: 'Stats', icon: BarChart2, label: 'Stats' },
    { id: 'Profile', icon: User, label: 'Me' },
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
              // Switch between fixed and flexible width based on active state
              style={[styles.tabItem, isActive ? styles.tabItemActive : styles.tabItemInactive]}
            >
              <Icon 
                size={22} 
                color={isActive ? '#1E3A8A' : '#94A3B8'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              {/* Only render text if active */}
              {isActive && (
                <Text style={styles.activeLabel}>{tab.label}</Text>
              )}
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
    width: '92%', 
    height: 65, 
    borderRadius: 35, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tabItem: { 
    flexDirection: 'row', // Align Icon and Text side-by-side
    alignItems: 'center', 
    justifyContent: 'center',
    height: 45,
    borderRadius: 25,
  },
  tabItemActive: {
    backgroundColor: '#E0E7FF', // Light blue background for active tab
    paddingHorizontal: 12,
    flex: 1.5, // Active tab takes slightly more space
  },
  tabItemInactive: {
    flex: 1,
  },
  activeLabel: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8, // Space between icon and text
  }
});