import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Polyline, Circle as SvgCircle } from 'react-native-svg';
import { useHealthDashboard } from '../src/hooks/useHealthDashboard';
import BottomNavigation from '../src/components/BottomNavigation';

const { width } = Dimensions.get('window');
const CHART_W = width - 36 - 28; // screen padding 18×2 + card padding 14×2
const CHART_H = 72;

// Placeholder trend data — replace with real weekly aggregation when available
const MOCK_RHR_TREND = [65, 63, 61, 64, 60, 58, 61, 57];
const MOCK_SPO2_WEEK = [96, 97, 98, 95, 98, 97, 96];

function rhrPoints(data: number[]): string {
  const min = 50, range = 25;
  return data
    .map((v, i) => `${(i / (data.length - 1)) * CHART_W},${CHART_H - ((v - min) / range) * CHART_H}`)
    .join(' ');
}

export default function HealthMetricsScreen() {
  const { snapshot } = useHealthDashboard();
  const rhr = snapshot?.heartRate.resting;
  const currentHr = snapshot?.heartRate.current;
  const spo2 = snapshot?.spo2;

  const polyline = rhrPoints(MOCK_RHR_TREND);
  const lastIdx = MOCK_RHR_TREND.length - 1;
  const lastX = CHART_W;
  const lastY = CHART_H - ((MOCK_RHR_TREND[lastIdx] - 50) / 25) * CHART_H;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <MaterialIcons name="favorite" size={22} color="#6effc0" />
          <Text style={styles.topTitle}>Health Metrics</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={22} color="#84958a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Resting Heart Rate – full-width trend card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Resting Heart Rate</Text>
              <Text style={styles.cardSub}>3-Week Longitudinal Trend</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metricLg}>
                {rhr ?? '--'}<Text style={styles.metricUnit}> bpm</Text>
              </Text>
              <Text style={styles.badge}>Health Connect</Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <Svg width={CHART_W} height={CHART_H}>
              <Polyline
                points={polyline}
                fill="none"
                stroke="#6effc0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <SvgCircle cx={lastX} cy={lastY} r={4} fill="#6effc0" />
            </Svg>
            <View style={styles.chartLabelRow}>
              {['WK 41', 'WK 42', 'WK 43', 'NOW'].map(l => (
                <Text key={l} style={styles.chartLabel}>{l}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── SpO2  +  Current HR ── */}
        <View style={styles.row}>
          {/* SpO2 */}
          <View style={[styles.card, styles.half]}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{spo2 != null ? 'LIVE' : 'NO DATA'}</Text>
            </View>
            <Text style={[styles.cardTitle, { marginTop: 6 }]}>SpO2</Text>
            <Text style={styles.bigValue}>
              {spo2 != null ? spo2.toFixed(1) : '--'}
              <Text style={styles.bigUnit}>%</Text>
            </Text>
            {/* 7-night mini bars */}
            <View style={styles.miniChart}>
              {MOCK_SPO2_WEEK.map((v, i) => (
                <View
                  key={i}
                  style={[
                    styles.miniBar,
                    { height: (v / 100) * 52 },
                    i === MOCK_SPO2_WEEK.length - 1 && styles.miniBarActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.cardSub}>7-night range</Text>
          </View>

          {/* Current HR */}
          <View style={[styles.card, styles.half]}>
            <MaterialIcons name="favorite" size={20} color="#ffb4ab" />
            <Text style={[styles.cardTitle, { marginTop: 8 }]}>Heart Rate</Text>
            <Text style={styles.bigValue}>
              {currentHr ?? '--'}
              <Text style={styles.bigUnit}> bpm</Text>
            </Text>
            <Text style={styles.cardSub}>Resting: {rhr ?? '--'} bpm</Text>
          </View>
        </View>

        {/* ── Body Composition – placeholder ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body Composition</Text>
          <Text style={styles.cardSub}>Not synced via Health Connect · log manually to track</Text>
          <View style={styles.compRow}>
            {[
              { label: 'WEIGHT', value: '--', unit: 'kg' },
              { label: 'BODY FAT', value: '--', unit: '%' },
              { label: 'BMI', value: '--', unit: '' },
            ].map(item => (
              <View key={item.label} style={styles.compItem}>
                <Text style={styles.compLabel}>{item.label}</Text>
                <Text style={styles.compValue}>
                  {item.value}<Text style={styles.bigUnit}>{item.unit}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Live telemetry footer ── */}
        <View style={styles.telemetry}>
          <View style={styles.telemetryRow}>
            <View style={styles.dot} />
            <Text style={styles.telemetryTitle}>LIVE TELEMETRY</Text>
          </View>
          <Text style={styles.telemetryLine}>[SYNC] Health Connect · Samsung Health origin</Text>
          {currentHr != null && (
            <Text style={styles.telemetryLine}>[HR] Current: {currentHr} BPM</Text>
          )}
          {rhr != null && (
            <Text style={styles.telemetryLine}>[RHR] Resting: {rhr} BPM</Text>
          )}
          {spo2 != null && (
            <Text style={styles.telemetryLine}>[SPO2] {spo2}% oxygen saturation</Text>
          )}
          {rhr == null && spo2 == null && (
            <Text style={styles.telemetryLine}>[WARN] No biometric readings found in past 24h</Text>
          )}
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

  scrollContent: { paddingHorizontal: 18, paddingBottom: 100, paddingTop: 12, gap: 12 },

  card: {
    backgroundColor: '#141420', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '500', color: '#dbe5dd' },
  cardSub: { fontSize: 11, color: '#84958a', marginTop: 2 },

  metricLg: { fontSize: 22, fontWeight: '300', color: '#6effc0' },
  metricUnit: { fontSize: 12, color: '#84958a' },
  badge: { fontSize: 10, color: 'rgba(110,255,192,0.6)', marginTop: 2 },

  chartLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { fontSize: 9, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase' },

  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  chip: {
    alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(110,255,192,0.1)', borderRadius: 4,
  },
  chipText: { fontSize: 9, fontWeight: '600', color: '#6effc0', letterSpacing: 1.5 },

  bigValue: { fontSize: 30, fontWeight: '300', color: '#F2F2FF', marginTop: 6 },
  bigUnit: { fontSize: 12, fontWeight: 'normal', color: '#84958a' },

  miniChart: { flexDirection: 'row', alignItems: 'flex-end', height: 52, gap: 3, marginTop: 10, marginBottom: 4 },
  miniBar: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
  miniBarActive: { backgroundColor: '#6effc0' },

  compRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  compItem: { alignItems: 'center' },
  compLabel: { fontSize: 9, fontWeight: '600', color: '#84958a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  compValue: { fontSize: 22, fontWeight: '300', color: '#F2F2FF' },

  telemetry: {
    backgroundColor: '#141420', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(110,255,192,0.1)',
  },
  telemetryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6effc0' },
  telemetryTitle: { fontSize: 9, fontWeight: '600', color: '#6effc0', letterSpacing: 2, textTransform: 'uppercase' },
  telemetryLine: { fontSize: 11, color: 'rgba(132,149,138,0.7)', lineHeight: 18 },
});
