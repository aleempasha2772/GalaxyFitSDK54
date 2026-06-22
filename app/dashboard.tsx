// app/dashboard.tsx
import React, { useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavigation from '../src/components/BottomNavigation';
import Svg, { Circle } from 'react-native-svg';
import { useHealthDashboard } from '../src/hooks/useHealthDashboard';
import { computeRecovery } from '../src/services/HealthDashboardService';

const { width } = Dimensions.get('window');
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 10;
const SIZE = 256;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DashboardScreen() {
  const router = useRouter();
  const { snapshot, loading, error, refresh } = useHealthDashboard();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const recovery = snapshot ? computeRecovery(snapshot) : 0;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: recovery,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [recovery, animatedProgress]);

  const dashOffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, CIRCUMFERENCE * 0.3],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6effc0" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!snapshot) return null;

  const {
    activity,
    heartRate,
    spo2,
    sleep,
    lastExercise,
  } = snapshot;

  const sleepDuration = sleep ? `${sleep.durationHours}h` : '--';

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBet0MOkrPHGhgNMiX9Cy1o6lET_wygendprmckgFVtgv19Pxo_k7LkcuetrUVVo6PWxLcgIT8Y2TzWZPnfoBdpOB_lyYWprocDUUpHxHz6y-OGixo1QghYn9Wfql_zIiauYUktZxa0U2xbBop_nc0Z3hyNByyjjkmulsoherduLSP4VL_1WiN_eKvEjeimzZk7w7D621JPIf_oEFm0JmO_rcFumjxAme8IP_-jlIrc1ca0DmbN5YC4HuW-dKhYVrEVMGtgEeFVlcbw' }}
            style={styles.profileImg}
          />
          <Text style={styles.greeting}>Good morning, Aleem</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/scanner')}>
            <MaterialIcons name="bluetooth-searching" size={24} color="#6effc0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection status */}
      <View style={styles.statusRow}>
        <View style={styles.pingContainer}>
          <View style={styles.ping} />
          <View style={styles.pingCore} />
        </View>
        <Text style={styles.statusText}>Galaxy Fit3 · Connected</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO RECOVERY ZONE */}
        <View style={styles.readinessSection}>
          <View style={styles.gaugeContainer}>
            <Svg width={SIZE} height={SIZE} viewBox="0 0 256 256" style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle
                cx="128" cy="128" r={RADIUS}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={0}
              />
              <AnimatedCircle
                cx="128" cy="128" r={RADIUS}
                stroke="#00E5A0"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.readinessScore}>
              <Text style={styles.scoreNumber}>{recovery}</Text>
              <Text style={styles.scoreLabel}>RECOVERY</Text>
            </View>
          </View>
          <View style={styles.readinessDetails}>
            <Text style={styles.hrvText}>
              {heartRate.current ? `RHR ${heartRate.current} bpm` : 'RHR --'} ·{' '}
              {sleep ? `Sleep ${sleepDuration}` : 'Sleep --'}
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Sleep {sleep ? sleepDuration : '--'}</Text>
              </View>
              <View style={[styles.tag, styles.tagRhr]}>
                <Text style={styles.tagTextRhr}>RHR {heartRate.current ?? '--'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ALL METRIC CARDS (no stress) */}
        <View style={styles.metricsGrid}>
          <MetricCard icon="directions-walk" value={activity.steps?.toLocaleString() ?? '--'} label="Steps" color="#6effc0" />
          <MetricCard icon="straighten" value={activity.distanceMeters ? `${(activity.distanceMeters / 1000).toFixed(1)} km` : '--'} label="Distance" color="#6effc0" />
          <MetricCard icon="favorite" value={heartRate.current ? `${heartRate.current}` : '--'} label="Heart Rate" color="#ffb4ab" unit=" bpm" />
          <MetricCard icon="whatshot" value={activity.totalCalories != null ? `${Math.round(activity.totalCalories).toLocaleString()}` : '--'} label="Total kcal" color="#fcba59" />
          <MetricCard icon="hotel" value={sleepDuration} label="Sleep" color="#9B7EFF" />
          <MetricCard icon="fitness-center" value={lastExercise ? lastExercise.type : '--'} label="Last Workout" color="#a8c8ff" />
          <MetricCard icon="opacity" value={spo2 ? `${spo2}%` : '--'} label="SpO₂" color="#6effc0" />
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

// ---------- Sub-components ----------
function MetricCard({ icon, value, label, color, unit = '', subtitle = '' }: { icon: string; value: string; label: string; color: string; unit?: string; subtitle?: string }) {
  return (
    <View style={styles.metricCard}>
      <MaterialIcons name={icon as any} size={20} color={color} />
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>
          {value}
          {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
        </Text>
        <Text style={styles.metricLabel}>{label}</Text>
        {subtitle ? <Text style={styles.metricSubtext}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function WorkoutChip({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.chip}>
      <MaterialIcons name={icon as any} size={16} color="#dbe5dd" />
      <Text style={styles.chipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25,   // was 20
    paddingTop: 15,          // was 10
    paddingBottom: 11,       // was 6
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 17 }, // gap +5
  profileImg: { width: 47, height: 47, borderRadius: 23.5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  greeting: { color: '#dbe5dd', fontSize: 23, fontWeight: '500', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  notifBtn: { padding: 13, borderRadius: 40, position: 'relative' }, // was 8
  notifDot: {
    position: 'absolute', top: 15, right: 15,     // was 10,10
    width: 14, height: 14,                       // was 9
    borderRadius: 7,                             // was 4.5
    backgroundColor: '#6effc0', borderWidth: 2, borderColor: COLORS.background,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 6, gap: 6 },
  pingContainer: { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  ping: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#6effc0', opacity: 0.4 },
  pingCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6effc0' },
  statusText: { color: '#84958a', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 90, gap: 12 },
  readinessSection: { alignItems: 'center', paddingVertical: 8, minHeight: 206 },
  gaugeContainer: { width: 184, height: 184, justifyContent: 'center', alignItems: 'center' },
  readinessScore: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: 56, lineHeight: 62, fontWeight: '200', color: '#F2F2FF', letterSpacing: -2 },
  scoreLabel: { fontSize: 10, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  readinessDetails: { marginTop: 8, alignItems: 'center' },
  hrvText: { fontSize: 12, fontStyle: 'italic', color: '#84958a', marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: 'rgba(168,200,255,0.2)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,200,255,0.2)' },
  tagText: { color: '#a8c8ff', fontSize: 10, fontWeight: '600' },
  tagRhr: { backgroundColor: 'rgba(110,255,192,0.1)', borderColor: 'rgba(110,255,192,0.2)' },
  tagTextRhr: { color: '#6effc0', fontSize: 10, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: {
    width: (width - 36 - 8) / 2, backgroundColor: '#141420',
    borderRadius: 10, padding: 11, gap: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  metricContent: {},
  metricValue: { fontSize: 26, lineHeight: 32, fontWeight: '300', color: '#F2F2FF', marginTop: 2 },
  metricUnit: { fontSize: 12, fontWeight: 'normal' },
  metricLabel: { fontSize: 10, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  metricSubtext: { fontSize: 10, color: '#84958a', marginTop: 2 },
  workoutCard: {
    backgroundColor: '#141420', borderRadius: 10, padding: 14,
    borderLeftWidth: 3, borderLeftColor: 'rgba(110,255,192,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  workoutTitle: { fontSize: 15, fontWeight: '500', color: '#dbe5dd' },
  chipRow: { gap: 6, paddingBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  chipLabel: { fontSize: 11, fontWeight: '500', color: '#dbe5dd' },
  insightsSection: { gap: 14 },
  insightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightsTitle: { fontSize: 10, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  insightCard: { backgroundColor: '#141420', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  insightIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(252,186,89,0.1)', justifyContent: 'center', alignItems: 'center' },
  insightContent: { flex: 1 },
  insightLabel: { fontSize: 13, fontWeight: '500', color: '#dbe5dd' },
  insightDesc: { fontSize: 11, color: '#84958a', marginTop: 2 },
  errorText: { fontSize: 15, color: '#ffb4ab', textAlign: 'center', marginBottom: 12 },
  retryText: { fontSize: 13, color: '#6effc0', textAlign: 'center', textDecorationLine: 'underline' },
});