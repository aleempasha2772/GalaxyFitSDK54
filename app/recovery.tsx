import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useHealthDashboard } from '../src/hooks/useHealthDashboard';
import BottomNavigation from '../src/components/BottomNavigation';

const { width } = Dimensions.get('window');

const GAUGE_RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const ARC_LENGTH = CIRCUMFERENCE * (240 / 360);
const CHART_W = width - 36 - 28;
const CHART_H = 80;

function computeRecoveryScore(rhr: number | null, sleepHours: number): number {
  const sleepScore = Math.min((sleepHours / 8) * 60, 60);
  const rhrScore = rhr == null ? 20
    : rhr < 50 ? 40 : rhr < 60 ? 35 : rhr < 70 ? 25 : 15;
  return Math.round(Math.min(sleepScore + rhrScore, 100));
}

function buildChartPath(w: number, h: number): string {
  return [
    `M0,${h * 0.9}`,
    `C${w * 0.15},${h * 0.7} ${w * 0.25},${h * 0.8} ${w * 0.38},${h * 0.5}`,
    `C${w * 0.5},${h * 0.2} ${w * 0.62},${h * 0.4} ${w * 0.75},${h * 0.3}`,
    `C${w * 0.85},${h * 0.15} ${w * 0.92},${h * 0.05} ${w},${h * 0.18}`,
  ].join(' ');
}

export default function RecoveryScreen() {
  const { snapshot } = useHealthDashboard();
  const rhr = snapshot?.heartRate.resting ?? null;
  const sleep = snapshot?.sleep ?? null;
  const activity = snapshot?.activity;

  const sleepHours = sleep?.durationHours ?? 0;
  const sleepQuality = Math.round(Math.min((sleepHours / 8) * 100, 100));
  const recoveryScore = computeRecoveryScore(rhr, sleepHours);
  const progressArc = (recoveryScore / 100) * ARC_LENGTH;

  const steps = activity?.steps ?? 0;
  const loadStatus = steps > 8000 ? 'Productive' : steps > 4000 ? 'Active' : 'Detraining';
  const loadFraction = Math.min(steps / 12000, 1);

  const statusLabel = recoveryScore >= 80 ? 'OPTIMAL STATE'
    : recoveryScore >= 60 ? 'GOOD STATE' : 'RECOVERY NEEDED';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialIcons name="spa" size={22} color="#6effc0" />
          <Text style={styles.topTitle}>Recovery & Readiness</Text>
        </View>
        <MaterialIcons name="settings" size={22} color="#84958a" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Arc Gauge */}
        <View style={styles.gaugeSection}>
          <View style={styles.gaugeWrap}>
            <Svg width={256} height={256} viewBox="0 0 240 240">
              {/* Background arc – 240° starting at 7:30 position */}
              <Circle
                cx={120} cy={120} r={GAUGE_RADIUS}
                fill="transparent"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={8}
                strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                rotation={150}
                originX={120}
                originY={120}
              />
              {/* Progress arc */}
              <Circle
                cx={120} cy={120} r={GAUGE_RADIUS}
                fill="transparent"
                stroke="#6effc0"
                strokeWidth={8}
                strokeDasharray={`${progressArc} ${CIRCUMFERENCE}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                rotation={150}
                originX={120}
                originY={120}
              />
            </Svg>
            <View style={styles.gaugeInner}>
              <Text style={styles.scoreNumber}>{recoveryScore}</Text>
              <Text style={styles.scoreLabel}>Recovery Score</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Sleep Quality + RHR */}
        <View style={styles.row}>
          <View style={[styles.card, styles.half]}>
            <Text style={styles.cardLabel}>SLEEP QUALITY</Text>
            <View style={styles.metricRow}>
              <MaterialIcons name="bed" size={18} color="#6effc0" />
              <Text style={styles.cardMetric}>{sleepQuality}%</Text>
            </View>
            <View style={styles.trendRow}>
              <MaterialIcons name="arrow-upward" size={14} color="#6effc0" />
              <Text style={styles.trendText}>{sleep ? `${sleep.durationHours.toFixed(1)}h` : 'No data'}</Text>
            </View>
          </View>
          <View style={[styles.card, styles.half]}>
            <Text style={styles.cardLabel}>RHR TREND</Text>
            <View style={styles.metricRow}>
              <MaterialIcons name="favorite" size={18} color="#6effc0" />
              <Text style={styles.cardMetric}>{rhr != null ? `${rhr} BPM` : '--'}</Text>
            </View>
            <View style={styles.trendRow}>
              <MaterialIcons name="arrow-downward" size={14} color="#6effc0" />
              <Text style={styles.trendText}>Resting</Text>
            </View>
          </View>
        </View>

        {/* Training Load */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardLabel}>TRAINING LOAD</Text>
              <Text style={styles.cardTitle}>{loadStatus}</Text>
            </View>
            <MaterialIcons name="info" size={20} color="#84958a" />
          </View>
          <View style={styles.loadBar}>
            <View style={{ flex: loadFraction * 100, backgroundColor: '#6effc0' }} />
            <View style={{ flex: (1 - loadFraction) * 100 }} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.loadEdge}>Detraining</Text>
            <Text style={[styles.loadEdge, { color: '#6effc0', fontWeight: '600' }]}>Optimal</Text>
            <Text style={styles.loadEdge}>Overreaching</Text>
          </View>
        </View>

        {/* Autonomic Balance */}
        <View style={styles.card}>
          <View style={[styles.rowBetween, { marginBottom: 12 }]}>
            <View>
              <Text style={styles.cardTitle}>Autonomic Balance</Text>
              <Text style={styles.cardSub}>7-Day RHR Stability</Text>
            </View>
            <Text style={styles.balanceValue}>High</Text>
          </View>
          <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
            <Path
              d={buildChartPath(CHART_W, CHART_H)}
              fill="none"
              stroke="#6effc0"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.chartAxis}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={[styles.axisLabel, i === 6 && { color: '#84958a' }]}>{d}</Text>
            ))}
          </View>
        </View>

        {/* System Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialIcons name="psychology" size={20} color="#6effc0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>System Insight</Text>
            <Text style={styles.insightDesc}>
              {recoveryScore >= 80
                ? "Your nervous system is showing high parasympathetic activity. Today is ideal for high-intensity CNS work. Avoid excessive caffeine to maintain this balance."
                : recoveryScore >= 60
                ? "Recovery is moderate. Consider a lighter session today and prioritize sleep tonight to maximize tomorrow's readiness."
                : "Low recovery detected. Prioritize rest, hydration, and avoid high-intensity training today."}
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: 'rgba(10,10,15,0.8)',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topTitle: { color: '#dbe5dd', fontSize: 17, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 18, paddingBottom: 100, paddingTop: 8, gap: 12 },

  gaugeSection: { alignItems: 'center', paddingVertical: 4 },
  gaugeWrap: { width: 256, height: 256, justifyContent: 'center', alignItems: 'center' },
  gaugeInner: { position: 'absolute', alignItems: 'center' },
  scoreNumber: { fontSize: 72, lineHeight: 80, fontWeight: '200', color: '#F2F2FF', letterSpacing: -2 },
  scoreLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  statusPill: {
    marginTop: 6, paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 40, backgroundColor: 'rgba(110,255,192,0.08)',
    borderWidth: 1, borderColor: 'rgba(110,255,192,0.2)',
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#6effc0', letterSpacing: 2, textTransform: 'uppercase' },

  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  card: {
    backgroundColor: '#141420', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLabel: { fontSize: 11, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#dbe5dd', marginTop: 4 },
  cardSub: { fontSize: 11, color: '#84958a', marginTop: 2 },
  cardMetric: { fontSize: 16, fontWeight: '500', color: '#dbe5dd' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, marginBottom: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  trendText: { fontSize: 12, color: '#6effc0' },

  loadBar: {
    height: 6, flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
    marginTop: 12, marginBottom: 8,
  },
  loadEdge: { fontSize: 10, color: '#84958a' },

  balanceValue: { fontSize: 22, fontWeight: '300', color: '#6effc0' },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel: { fontSize: 11, color: 'rgba(132,149,138,0.5)' },

  insightCard: {
    backgroundColor: 'rgba(110,255,192,0.05)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(110,255,192,0.1)',
    flexDirection: 'row', gap: 12,
  },
  insightIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(110,255,192,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  insightTitle: { fontSize: 15, fontWeight: '500', color: '#dbe5dd', marginBottom: 4 },
  insightDesc: { fontSize: 12, color: '#84958a', lineHeight: 18 },
});
