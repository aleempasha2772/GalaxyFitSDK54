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
import { MaterialIcons } from '@expo/vector-icons';
import { useHealthDashboard } from '../src/hooks/useHealthDashboard';
import type { SleepData } from '../src/types/health';
import BottomNavigation from '../src/components/BottomNavigation';

const { width } = Dimensions.get('window');

// ---------- Helpers ----------
function computeSleepScore(sleep: SleepData | null): number {
  if (!sleep) return 0;
  let score = 0;
  // Duration up to 8h = 50 points
  score += Math.min((sleep.durationHours / 8) * 50, 50);
  // Stage quality: deep + rem = up to 50 points
  const deepMin = sleep.stages
    .filter(s => s.stage === 'Deep')
    .reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const remMin = sleep.stages
    .filter(s => s.stage === 'REM')
    .reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const deepPct = Math.min(deepMin / 1.5, 1);  // 1.5h deep = max
  const remPct = Math.min(remMin / 2, 1);      // 2h rem = max
  score += (deepPct * 25) + (remPct * 25);
  return Math.round(Math.min(score, 100));
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function getStageDuration(sleep: SleepData | null, stageName: string): number {
  if (!sleep) return 0;
  return sleep.stages
    .filter(s => s.stage === stageName)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

// ---------- Weekly placeholder (you can replace with real data) ----------
const mockWeeklyHours = [6.5, 7.2, 6.8, 7.5, 6.0, 7.8, 7.4]; // hours per day
const maxWeeklyHours = 8; // target

export default function SleepAnalysisScreen() {
  const router = useRouter();
  const { snapshot } = useHealthDashboard();
  const sleep = snapshot?.sleep ?? null;
  const spo2 = snapshot?.spo2;

  const sleepScore = computeSleepScore(sleep);
  const deepMinutes = getStageDuration(sleep, 'Deep');
  const remMinutes = getStageDuration(sleep, 'REM');
  const lightMinutes = getStageDuration(sleep, 'Light');
  const awakeMinutes = getStageDuration(sleep, 'Awake');
  const totalMinutes = deepMinutes + remMinutes + lightMinutes + awakeMinutes;
  const deepPct = totalMinutes ? Math.round((deepMinutes / totalMinutes) * 100) : 0;
  const remPct = totalMinutes ? Math.round((remMinutes / totalMinutes) * 100) : 0;
  const lightPct = totalMinutes ? Math.round((lightMinutes / totalMinutes) * 100) : 0;
  const awakePct = totalMinutes ? Math.round((awakeMinutes / totalMinutes) * 100) : 0;

  const sleepDebtHours = 8 - (sleep?.durationHours ?? 0);
  const sleepDebtStr = sleepDebtHours > 0 ? `-${formatDuration(sleepDebtHours)}` : 'On track';

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#6effc0" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Sleep Analysis</Text>
          <Text style={styles.subtitle}>
            Last Night · {sleep ? new Date(sleep.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No data'}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialIcons name="share" size={24} color="#84958a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Circular Sleep Score */}
        <View style={styles.gaugeSection}>
          <View style={styles.gaugeContainer}>
            {/* Circular progress (simple filled circle + background) */}
            <View style={styles.gaugeRing}>
              <View style={[styles.gaugeFill, { width: `${sleepScore}%`, height: `${sleepScore}%` }]} />
            </View>
            <View style={styles.gaugeText}>
              <Text style={styles.scoreNumber}>{sleepScore}</Text>
              <Text style={styles.scoreLabel}>
                {sleepScore >= 80 ? 'Excellent' : sleepScore >= 60 ? 'Good' : 'Fair'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Total Duration Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardLabel}>Total Duration</Text>
              <Text style={styles.cardValue}>{sleep ? formatDuration(sleep.durationHours) : 'No data'}</Text>
            </View>
            <View style={styles.goalSection}>
              <Text style={styles.goalText}>Goal: 8h 00m</Text>
              <View style={styles.goalBar}>
                <View style={[styles.goalFill, { width: `${Math.min((sleep?.durationHours ?? 0) / 8 * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Stage Breakdown Grid */}
        <View style={styles.stageGrid}>
          <StageCard label="DEEP" duration={deepMinutes} percentage={deepPct} />
          <StageCard label="REM" duration={remMinutes} percentage={remPct} />
          <StageCard label="LIGHT" duration={lightMinutes} percentage={lightPct} />
          <StageCard label="AWAKE" duration={awakeMinutes} percentage={awakePct} />
        </View>

        {/* 4. Additional Data Points */}
        <View style={styles.dataRow}>
          <DataPoint label="Sleep Debt" value={sleepDebtStr} color="#6effc0" />
          <DataPoint label="Consistency" value="94%" color="#dbe5dd" />
          <DataPoint label="Avg SpO2" value={spo2 ? `${spo2}%` : '--'} color="#dbe5dd" />
        </View>

        {/* 5. Sleep Stages Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Sleep Stages</Text>
          <View style={styles.timelineBar}>
            {sleep?.stages.map((s, i) => {
              const stageWidth = (s.durationMinutes / totalMinutes) * 100;
              const color =
                s.stage === 'Deep' ? '#312E81' :
                s.stage === 'REM' ? '#C3B4FF' :
                s.stage === 'Light' ? '#9B7EFF' : '#ffb4ab';
              return (
                <View
                  key={i}
                  style={[styles.timelineSegment, { width: `${stageWidth}%`, backgroundColor: color }]}
                />
              );
            })}
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>11:30 PM</Text>
            <Text style={styles.timelineLabel}>2 AM</Text>
            <Text style={styles.timelineLabel}>4 AM</Text>
            <Text style={styles.timelineLabel}>7:00 AM</Text>
          </View>
        </View>

        {/* 6. Weekly Bar Chart (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekChart}>
            {mockWeeklyHours.map((h, i) => {
              const heightPercent = (h / maxWeeklyHours) * 100;
              const isToday = i === 6; // last element as today
              return (
                <View key={i} style={styles.barContainer}>
                  <View style={[styles.bar, { height: `${heightPercent}%` }, isToday && styles.barToday]} />
                </View>
              );
            })}
          </View>
          <View style={styles.weekLabels}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={[styles.weekLabel, i === 6 && styles.weekLabelToday]}>{d}</Text>
            ))}
          </View>
        </View>

        {/* 7. 30-Day Trend (placeholder line) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration Trends</Text>
          <View style={styles.trendCard}>
            <View style={styles.trendLine} />
          </View>
        </View>

        {/* 8. Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialIcons name="psychology" size={20} color="#6effc0" />
          </View>
          <View style={styles.insightText}>
            <Text style={styles.insightTitle}>Recovery Insight</Text>
            <Text style={styles.insightDesc}>
              Your high REM sleep indicates effective cognitive recovery. However, a {sleepDebtHours > 0 ? formatDuration(sleepDebtHours) + ' debt remains' : 'sleep debt is low'}. Try to sleep 15 mins earlier tonight to optimize tomorrow's readiness.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
    <BottomNavigation />
      
    </View>
  );
}

// ---------- Sub-components ----------
function StageCard({ label, duration, percentage }: { label: string; duration: number; percentage: number }) {
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  return (
    <View style={styles.stageCard}>
      <Text style={styles.stageLabel}>{label}</Text>
      <Text style={styles.stageDuration}>{hours}h {mins}m</Text>
      <Text style={styles.stagePct}>{percentage}%</Text>
    </View>
  );
}

function DataPoint({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.dataPoint}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, { color }]}>{value}</Text>
    </View>
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
  backBtn: { padding: 8 },
  title: { color: '#dbe5dd', fontSize: 18, fontWeight: '500' },
  subtitle: { color: '#84958a', fontSize: 12 },
  shareBtn: { padding: 8 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, gap: 24, paddingTop: 16 },

  gaugeSection: { alignItems: 'center', marginTop: 8 },
  gaugeContainer: {
    width: 160, height: 160, justifyContent: 'center', alignItems: 'center',
    borderRadius: 80, borderWidth: 6, borderColor: '#141420',
    backgroundColor: '#0A0A0F',
  },
  gaugeRing: {
    position: 'absolute', width: '100%', height: '100%',
  },
  gaugeFill: {
    position: 'absolute', bottom: 0, left: 0,
    backgroundColor: '#6effc0', opacity: 0.3, borderRadius: 80,
  },
  gaugeText: { alignItems: 'center' },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: '#F2F2FF' },
  scoreLabel: { fontSize: 11, fontWeight: '600', color: '#6effc0', letterSpacing: 2, textTransform: 'uppercase' },

  card: { backgroundColor: '#141420', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  cardValue: { fontSize: 32, fontWeight: '300', color: '#F2F2FF', marginTop: 4 },
  goalSection: { alignItems: 'flex-end' },
  goalText: { fontSize: 12, color: '#6effc0' },
  goalBar: { width: 80, height: 4, backgroundColor: '#2e3731', borderRadius: 2, marginTop: 4 },
  goalFill: { height: '100%', backgroundColor: '#6effc0', borderRadius: 2 },

  stageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stageCard: {
    width: (width - 40 - 12) / 2, backgroundColor: '#141420',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  stageLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  stageDuration: { fontSize: 20, fontWeight: '500', color: '#dbe5dd' },
  stagePct: { fontSize: 12, color: '#84958a' },

  dataRow: { flexDirection: 'row', gap: 12 },
  dataPoint: {
    flex: 1, backgroundColor: '#141420', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  dataLabel: { fontSize: 10, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  dataValue: { fontSize: 16, fontWeight: 'bold' },

  timelineSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '500', color: '#dbe5dd', marginBottom: 8 },
  timelineBar: { flexDirection: 'row', height: 40, borderRadius: 8, overflow: 'hidden' },
  timelineSegment: { height: '100%' },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  timelineLabel: { fontSize: 10, color: '#84958a' },

  section: { gap: 12 },
  weekChart: { height: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barContainer: { flex: 1, marginHorizontal: 2, alignItems: 'center' },
  bar: { width: '70%', backgroundColor: '#141420', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barToday: { backgroundColor: 'rgba(110,255,192,0.4)', borderColor: '#6effc0', borderWidth: 1 },
  weekLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  weekLabel: { fontSize: 10, color: '#84958a', textTransform: 'uppercase' },
  weekLabelToday: { color: '#6effc0', fontWeight: '600' },

  trendCard: { backgroundColor: '#141420', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  trendLine: { width: '90%', height: 20, backgroundColor: '#6effc0', opacity: 0.2, borderRadius: 10 }, // placeholder

  insightCard: {
    backgroundColor: '#141420', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderLeftWidth: 4, borderLeftColor: '#6effc0',
  },
  insightIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(110,255,192,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 14, fontWeight: '500', color: '#dbe5dd', marginBottom: 4 },
  insightDesc: { fontSize: 12, color: '#84958a', lineHeight: 18 },

});