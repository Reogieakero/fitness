import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  Dimensions, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Target, Flame, TrendingUp, Trophy, 
  ChevronRight, Award, Activity
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Afternoon,</Text>
            <Text style={styles.userName}>Hero</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame color="#F97316" size={18} fill="#F97316" />
            <Text style={styles.streakText}>0</Text>
          </View>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelSub}>RANK</Text>
              <Text style={styles.levelTitle}>Novice Hero</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>LVL 1</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '12%' }]} />
            </View>
            <View style={styles.progressLabelRow}>
               <Text style={styles.progressText}>12 / 100 XP</Text>
               <Text style={styles.progressText}>Next: Iron Tier</Text>
            </View>
          </View>
        </View>

        {/* Pro Stats Grid */}
        <View style={styles.statsGrid}>
          <StatBox 
            icon={<Target color="#1E40AF" size={18} />} 
            value="0" 
            label="Workouts" 
            sub="Today"
          />
          <StatBox 
            icon={<Activity color="#059669" size={18} />} 
            value="0" 
            label="Calories" 
            sub="Burned"
          />
          <StatBox 
            icon={<Trophy color="#D97706" size={18} />} 
            value="1" 
            label="Badges" 
            sub="Earned"
          />
        </View>

        {/* Recent Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.achievementCard}>
          <View style={styles.achievementIconBox}>
            <Award color="#F59E0B" size={24} />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Welcome Hero</Text>
            <Text style={styles.achievementSub}>Started your fitness journey</Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "The only bad workout is the one that didn't happen"
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ icon, value, label, sub }) => (
  <View style={styles.statBox}>
    <View style={styles.statTopRow}>
      <View style={styles.statIconWrapper}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <View style={styles.statTextWrapper}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubLabel}>{sub}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '500', letterSpacing: 0.5 },
  userName: { fontSize: 32, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  streakBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  streakText: { marginLeft: 6, fontWeight: '800', fontSize: 16, color: '#0F172A' },
  
  levelCard: { 
    backgroundColor: '#1E3A8A', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 16,
    overflow: 'hidden'
  },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  levelTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  xpBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  
  progressContainer: { marginTop: 20 },
  progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#60A5FA', borderRadius: 3 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

  // Updated Pro Stats Grid
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 12, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    minHeight: 100 // Fixed height to prevent stretching
  },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statIconWrapper: { padding: 6, borderRadius: 10, backgroundColor: '#F1F5F9' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  statTextWrapper: { marginTop: 'auto' },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  statSubLabel: { fontSize: 10, fontWeight: '500', color: '#94A3B8', textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  viewAll: { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  achievementCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  achievementIconBox: { width: 44, height: 44, backgroundColor: '#FEF3C7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementInfo: { flex: 1, marginLeft: 12 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  achievementSub: { fontSize: 12, color: '#64748B' },

  quoteCard: { 
    marginTop: 24, 
    backgroundColor: '#0F172A', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  quoteText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 }
});