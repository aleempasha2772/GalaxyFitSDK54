// app/workouts.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

const { width } = Dimensions.get('window');

export default function WorkoutsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP APP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#6effc0" />
          </TouchableOpacity>
          <Text style={styles.title}>Workouts</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="sensors" size={24} color="#84958a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Select Activity</Text>
          <Text style={styles.heroSubtitle}>
            Precision tracking for your peak performance.
          </Text>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          <View style={[styles.chip, styles.chipActive]}>
            <MaterialIcons name="filter-list" size={14} color="#6effc0" />
            <Text style={styles.chipTextActive}>All Types</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Cardio</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Strength</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Recovery</Text>
          </View>
        </ScrollView>

        {/* EXERCISE GRID */}
        <View style={styles.grid}>
          <ExerciseCard icon="directions-walk" title="Walking" subtitle="Avg 110 BPM" />
          <ExerciseCard icon="directions-run" title="Running" subtitle="Avg 165 BPM" />
          <ExerciseCard icon="fitness-center" title="Weight Training" subtitle="Hypertrophy" onPress={() => {
            console.log('Weight Training card clicked');
            router.push('/muscle-select');
          }} />
          <ExerciseCard icon="directions-bike" title="Cycling" subtitle="Endurance" />
          <ExerciseCard icon="pool" title="Swimming" subtitle="Full Body" />
          <ExerciseCard icon="self-improvement" title="Yoga" subtitle="Mobility" />
          <ExerciseCard icon="bolt" title="HIIT" subtitle="High Intensity" />
          <ExerciseCard icon="terrain" title="Hiking" subtitle="Elevation Gain" />
          <ExerciseCard icon="terrain" title="Dancing" subtitle="Recreation" />
          <ExerciseCard icon="terrain" title="Sports" subtitle="Varied Intensity" />
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION (same as dashboard) */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" onPress={() => router.push('/dashboard')} />
        <NavItem icon="fitness-center" label="Workouts" active />
        <NavItem icon="bed" label="Sleep" onPress={() => {}} />
        <NavItem icon="timer" label="Live" />
        <NavItem icon="analytics" label="Summary" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

// ---------- Sub-components ----------

function ExerciseCard({ icon, title, subtitle,onPress }: { icon: string; title: string; subtitle: string ; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.cardGlow} />
      <MaterialIcons name={icon as any} size={30} color="#6effc0" style={styles.cardIcon} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function NavItem({ icon, label, onPress, active = false }: { icon: string; label: string; onPress?: () => void; active?: boolean }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialIcons
        name={icon as any}
        size={24}
        color={active ? '#6effc0' : '#84958a'}
        style={active && styles.activeIcon}
      />
      <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}



// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbe5dd',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 24,
  },
  heroSection: {
    marginTop: 8,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '300',
    color: '#F2F2FF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#84958a',
  },
  chipsContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(110,255,192,0.1)',
    borderColor: 'rgba(110,255,192,0.2)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dbe5dd',
  },
  chipTextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6effc0',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(110,255,192,0.05)',
    opacity: 0.5,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbe5dd',
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(20,20,32,0.8)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#84958a',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#6effc0',
  },
  activeIcon: {
    textShadowColor: 'rgba(110,255,192,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});