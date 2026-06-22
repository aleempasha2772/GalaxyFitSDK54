import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useHealthDashboard } from '../src/hooks/useHealthDashboard';
import type { HealthSnapshot } from '../src/types/health';
import BottomNavigation from '../src/components/BottomNavigation';

const { width } = Dimensions.get('window');

// ---------- Helpers ----------
const formatKm = (meters: number | null): string => {
  if (meters == null) return '--';
  return (meters / 1000).toFixed(1);
};

const formatMinutes = (hours: number): number => Math.round(hours * 60);

// ---------- Mock training load data (replace with real weekly aggregation) ----------
const weeklyLoad = [40, 60, 35, 85, 75, 50, 20]; // percentages
const weekdayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// ---------- Mock recent sessions (replace with Health Connect history) ----------
const mockSessions = [
  {
    id: '1',
    type: 'Chest & Triceps',
    icon: 'fitness-center',
    date: 'Today',
    duration: '1h 12m',
    volume: '8,400kg',
    avgBpm: '145',
    rpe: '8.5',
    color: '#6effc0',
  },
  {
    id: '2',
    type: 'Evening Recovery Run',
    icon: 'directions-run',
    date: 'Yesterday',
    duration: '34m',
    volume: '5.2km',
    avgBpm: '132',
    rpe: '4.0',
    color: '#a8c8ff',
  },
  {
    id: '3',
    type: 'Legs & Posterior Chain',
    icon: 'vertical-align-bottom',
    date: 'Oct 24',
    duration: '1h 45m',
    volume: '12,200kg',
    avgBpm: '158',
    rpe: '9.0',
    color: '#fcba59',
  },
];

export default function TrainingLoadScreen() {
  const router = useRouter();
  const { snapshot } = useHealthDashboard();
  const activity = snapshot?.activity;
  const lastExercise = snapshot?.lastExercise;

  // Derive simple load status from today's activity (placeholder logic)
  const steps = activity?.steps ?? 0;
  const activeMinutes = 42; // placeholder – you can later sum from sessions
  const loadStatus = steps > 8000 ? 'Productive' : 'Active';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialIcons name="monitor" size={24} color="#6effc0" />
          <Text style={styles.topTitle}>Training & Activity</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <MaterialIcons name="settings" size={24} color="#84958a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO: Training Load Status */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Current Status</Text>
              <Text style={styles.heroValue}>{loadStatus}</Text>
            </View>
            <View style={styles.loadRatioBox}>
              <Text style={styles.loadRatioLabel}>LOAD RATIO</Text>
              <Text style={styles.loadRatioValue}>1.2 <Text style={styles.loadRatioUnit}>↑</Text></Text>
            </View>
          </View>

          {/* Weekly Load Bar Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              Training Load: Weekly volume calculated by intensity (RPE) × total duration.
            </Text>
            <View style={styles.barChart}>
              {weeklyLoad.map((load, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={[styles.bar, { height: `${load}%` }, index === 4 && styles.barActive]} />
                </View>
              ))}
            </View>
            <View style={styles.chartLabels}>
              {weekdayLabels.map((day, index) => (
                <Text key={index} style={styles.chartLabel}>{day}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ACTIVITY SUMMARY BENTO GRID */}
        <View style={styles.bentoGrid}>
          <BentoCard
            icon="footprint"
            value={steps.toLocaleString()}
            label="STEPS"
            color="#6effc0"
            trend="↑ 12%"
          />
          <BentoCard
            icon="distance"
            value={formatKm(activity?.distanceMeters ?? null)}
            label="KM"
            color="#a8c8ff"
            trend="Stable"
          />
          <BentoCard
            icon="local-fire-department"
            value={activity?.totalCalories?.toString() ?? '--'}
            label="KCAL"
            color="#fcba59"
            trend="↓ 4%"
          />
          <BentoCard
            icon="timer"
            value={activeMinutes.toString()}
            label="MINS"
            color="#6effc0"
            trend="Goal!"
            filled
          />
        </View>

        {/* VOLUME TRENDS 30D (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progressive Overload (30D)</Text>
          <View style={styles.trendCard}>
            <View style={styles.trendLine}>
              <View style={styles.trendDots}>
                <View style={[styles.trendDot, { top: '30%', left: '40%' }]} />
                <View style={[styles.trendDot, { top: '50%', left: '70%' }]} />
                <View style={[styles.trendDot, { top: '60%', left: '90%' }]} />
              </View>
              <View style={styles.trendLabelRow}>
                <Text style={styles.trendLabelLeft}>TOTAL VOL</Text>
                <Text style={styles.trendValue}>+4,250 kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* RECENT SESSIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.filterRow}>
              <FilterChip label="ALL" active />
              <FilterChip label="STRENGTH" />
              <FilterChip label="CARDIO" />
            </View>
          </View>

          <View style={styles.sessionList}>
            {lastExercise && (
              <SessionCard
                type={lastExercise.type}
                icon="fitness-center"
                date="Today"
                duration={`${lastExercise.durationMinutes}m`}
                volume="-- kg"
                avgBpm="--"
                rpe="--"
                color="#6effc0"
              />
            )}
            {mockSessions.map((s) => (
              <SessionCard
                key={s.id}
                type={s.type}
                icon={s.icon}
                date={s.date}
                duration={s.duration}
                volume={s.volume}
                avgBpm={s.avgBpm}
                rpe={s.rpe}
                color={s.color}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <BottomNavigation />

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/workouts')}>
        <MaterialIcons name="add" size={24} color="#0A0A0F" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ---------- Sub-components ----------

function BentoCard({ icon, value, label, color, trend, filled }: { icon: string; value: string; label: string; color: string; trend: string; filled?: boolean }) {
  return (
    <View style={[styles.bentoCard, filled && styles.bentoCardFilled]}>
      <MaterialIcons name={icon as any} size={24} color={color} style={filled && { color: '#0A0A0F' }} />
      <Text style={[styles.bentoValue, { color }]}>{value}</Text>
      <View style={styles.bentoBottom}>
        <Text style={styles.bentoLabel}>{label}</Text>
        <Text style={[styles.bentoTrend, { color }]}>{trend}</Text>
      </View>
    </View>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SessionCard({ type, icon, date, duration, volume, avgBpm, rpe, color }: { type: string; icon: string; date: string; duration: string; volume: string; avgBpm: string; rpe: string; color: string }) {
  return (
    <TouchableOpacity style={styles.sessionCard} activeOpacity={0.7}>
      <View style={styles.sessionLeft}>
        <View style={[styles.sessionIcon, { backgroundColor: `${color}20` }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        <View>
          <Text style={styles.sessionType}>{type}</Text>
          <Text style={styles.sessionMeta}>{date} • {duration} • {volume} vol</Text>
        </View>
      </View>
      <View style={styles.sessionRight}>
        <Text style={[styles.sessionBpm, { color }]}>{avgBpm} <Text style={styles.sessionBpmUnit}>bpm avg</Text></Text>
        <Text style={styles.sessionRpe}>RPE {rpe}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6,
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topTitle: { color: '#dbe5dd', fontSize: 18, fontWeight: '500' },
  settingsBtn: { padding: 8 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 150, gap: 24, paddingTop: 16 },

  // Hero Section
  heroSection: { gap: 16 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  heroValue: { fontSize: 36, fontWeight: '300', color: '#6effc0', marginTop: 4 },
  loadRatioBox: { alignItems: 'flex-end' },
  loadRatioLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  loadRatioValue: { fontSize: 16, fontWeight: '500', color: '#6effc0' },
  loadRatioUnit: { fontSize: 12, color: '#6effc0', opacity: 0.5 },

  chartCard: {
    backgroundColor: '#141420', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    height: 200,
  },
  chartTitle: { fontSize: 12, color: '#84958a', marginBottom: 12 },
  barChart: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4 },
  barColumn: { flex: 1, alignItems: 'center' },
  bar: {
    width: '60%', backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  barActive: { backgroundColor: '#6effc0', shadowColor: '#6effc0', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 },
  chartLabel: { fontSize: 10, color: '#84958a', fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },

  // Bento Grid
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bentoCard: {
    width: (width - 40 - 12) / 2, backgroundColor: '#141420',
    borderRadius: 12, padding: 16, aspectRatio: 1, justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  bentoCardFilled: { backgroundColor: '#6effc0', borderColor: '#6effc0' },
  bentoValue: { fontSize: 36, fontWeight: '300', marginTop: 8 },
  bentoBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bentoLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  bentoTrend: { fontSize: 10 },

  // Section common
  section: { gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: { backgroundColor: 'rgba(110,255,192,0.15)', borderColor: '#6effc0' },
  filterText: { fontSize: 10, fontWeight: '600', color: '#84958a', textTransform: 'uppercase', letterSpacing: 1.5 },
  filterTextActive: { color: '#6effc0' },

  trendCard: { backgroundColor: '#141420', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 120 },
  trendLine: { flex: 1, position: 'relative' },
  trendDots: {},
  trendDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#6effc0' },
  trendLabelRow: { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, right: 0 },
  trendLabelLeft: { fontSize: 10, color: '#84958a', fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  trendValue: { fontSize: 16, fontWeight: '500', color: '#6effc0' },

  // Session List
  sessionList: { gap: 12 },
  sessionCard: {
    backgroundColor: '#141420', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sessionType: { fontSize: 16, fontWeight: '500', color: '#dbe5dd' },
  sessionMeta: { fontSize: 12, color: '#84958a', marginTop: 2 },
  sessionRight: { alignItems: 'flex-end' },
  sessionBpm: { fontSize: 16, fontWeight: '500' },
  sessionBpmUnit: { fontSize: 10, fontWeight: 'normal', color: '#84958a' },
  sessionRpe: { fontSize: 10, color: '#84958a', marginTop: 2 },

  // FAB
  fab: {
    position: 'absolute', bottom: 110, right: 20,
    width: 56, height: 56, borderRadius: 16, backgroundColor: '#6effc0',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6effc0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});