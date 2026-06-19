// app/live-workout.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function LiveWorkoutScreen() {
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(2535); // starting at 42:15
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const heartRate = 138;
  const calories = 312;
  const avgHeartRate = 124;
  const effortScore = 67;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#bacbbf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weight Machines</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE SESSION</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <MaterialIcons name="pause" size={24} color="#bacbbf" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="stop-circle" size={24} color="#ffb4ab" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ELAPSED TIME HERO */}
        <View style={styles.heroSection}>
          <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
          <View style={styles.syncRow}>
            <MaterialIcons name="sync" size={14} color="#84958a" />
            <Text style={styles.syncText}>Active session · Samsung Fit3 syncing</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* PRIMARY METRICS GRID (2x2) */}
        <View style={styles.metricsGrid}>
          {/* HEART RATE */}
          <View style={styles.metricCardHeart}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>HEART RATE</Text>
              <MaterialIcons name="favorite" size={20} color="#f97316" />
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueLargeOrange}>{heartRate}</Text>
              <Text style={styles.unitText}>BPM</Text>
            </View>
            <Svg width="100%" height={32} viewBox="0 0 100 30" preserveAspectRatio="none">
              <Path
                d="M0,25 L10,22 L20,28 L30,15 L40,18 L50,10 L60,12 L70,5 L80,8 L90,12 L100,2"
                stroke="#f97316"
                strokeWidth={2}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </Svg>
            <View style={styles.zoneBadge}>
              <Text style={styles.zoneText}>Zone 3 · Aerobic</Text>
            </View>
          </View>

          {/* CALORIES */}
          <View style={styles.metricCardCalories}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>CALORIES</Text>
              <MaterialIcons name="local-fire-department" size={20} color="#f59e0b" />
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueLargeAmber}>{calories}</Text>
              <Text style={styles.unitText}>KCAL</Text>
            </View>
            <Text style={styles.subText}>kcal burned</Text>
            <View style={styles.progressBarSmall}>
              <View style={[styles.progressSmallFill, { width: '45%' }]} />
            </View>
          </View>

          {/* AVG HEART RATE */}
          <View style={styles.metricCardDefault}>
            <Text style={styles.cardLabel}>AVG HEART RATE</Text>
            <View style={styles.valueRow}>
              <Text style={styles.valueMedium}>{avgHeartRate}</Text>
              <Text style={styles.unitTextSmall}>bpm</Text>
            </View>
            <View style={styles.barChart}>
              <View style={[styles.bar, { height: '20%' }]} />
              <View style={[styles.bar, { height: '40%' }, styles.barBlue]} />
              <View style={[styles.bar, { height: '75%' }, styles.barGreen]} />
              <View style={[styles.bar, { height: '90%' }, styles.barOrange]} />
              <View style={[styles.bar, { height: '15%' }, styles.barRed]} />
            </View>
          </View>

          {/* EFFORT SCORE */}
          <View style={styles.metricCardDefault}>
            <Text style={styles.cardLabel}>EFFORT SCORE</Text>
            <View style={styles.valueRow}>
              <Text style={styles.valueMediumGreen}>{effortScore}</Text>
              <Text style={styles.unitTextSmall}>/ 100</Text>
            </View>
            <Text style={styles.subText}>Based on HR zones</Text>
            <View style={styles.gaugeContainer}>
              <Svg width={48} height={48} viewBox="0 0 36 36">
                <Path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2e3731"
                  strokeWidth={2}
                />
                <Path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#6effc0"
                  strokeDasharray={`${effortScore}, 100`}
                  strokeWidth={2}
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* HR ZONE TREND CHART */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.cardLabel}>Heart Rate Trend</Text>
            <Text style={styles.trendDuration}>42 MIN SESSION</Text>
          </View>
          <View style={styles.zoneBands}>
            <View style={[styles.zoneBand, { backgroundColor: 'rgba(239,68,68,0.05)' }]} />
            <View style={[styles.zoneBand, { backgroundColor: 'rgba(249,115,22,0.05)' }]} />
            <View style={[styles.zoneBand, { backgroundColor: 'rgba(34,197,94,0.05)' }]} />
            <View style={[styles.zoneBand, { backgroundColor: 'rgba(59,130,246,0.05)' }]} />
            <View style={[styles.zoneBand, { backgroundColor: 'rgba(148,163,184,0.05)' }]} />
          </View>
          <Svg width="100%" height={100} viewBox="0 0 400 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#3b82f6" />
                <Stop offset="50%" stopColor="#22c55e" />
                <Stop offset="100%" stopColor="#f97316" />
              </LinearGradient>
            </Defs>
            <Path
              d="M0,90 C50,85 80,70 120,75 C160,80 200,40 250,45 C300,50 350,20 400,25"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
            />
            <Circle cx="400" cy="25" r="4" fill="#f97316" />
          </Svg>
          <View style={styles.trendLabels}>
            <Text style={styles.labelSmall}>0m</Text>
            <Text style={styles.labelSmall}>10m</Text>
            <Text style={styles.labelSmall}>20m</Text>
            <Text style={styles.labelSmall}>30m</Text>
            <Text style={styles.labelSmall}>40m</Text>
          </View>
        </View>

        {/* ADD NOTE BAR */}
        <TouchableOpacity style={styles.noteBar} activeOpacity={0.7}>
          <Text style={styles.noteText}>Add a note to this session →</Text>
          <MaterialIcons name="edit" size={18} color="#84958a" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(10,10,15,0.9)',
  },
  headerTitle: {
    color: '#dbe5dd',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderColor: 'rgba(110,255,192,0.2)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6effc0',
    marginRight: 4,
    opacity: 1, // you can add pulsing with Animated later
  },
  liveText: {
    color: '#6effc0',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
  },
  timer: {
    fontSize: 56,
    fontFamily: 'JetBrains Mono', // may need to link custom font, fallback to monospace
    fontWeight: '200',
    color: '#dbe5dd',
    letterSpacing: -1,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#84958a',
  },
  progressBar: {
    width: '100%',
    height: 1,
    backgroundColor: '#3b4a41',
    marginTop: 32,
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#6effc0',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCardHeart: {
    width: '47%',
    backgroundColor: '#141420',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  metricCardCalories: {
    width: '47%',
    backgroundColor: '#141420',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricCardDefault: {
    width: '47%',
    backgroundColor: '#141420',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  valueLargeOrange: {
    fontSize: 42,
    fontWeight: '200',
    color: '#f97316',
  },
  valueLargeAmber: {
    fontSize: 36,
    fontWeight: '200',
    color: '#f59e0b',
  },
  valueMedium: {
    fontSize: 28,
    fontWeight: '300',
    color: '#dbe5dd',
  },
  valueMediumGreen: {
    fontSize: 28,
    fontWeight: '300',
    color: '#6effc0',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  unitTextSmall: {
    fontSize: 11,
    color: '#84958a',
    marginLeft: 4,
  },
  subText: {
    fontSize: 12,
    color: '#84958a',
    marginTop: 4,
  },
  zoneBadge: {
    backgroundColor: 'rgba(249,115,22,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 8,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fb923c',
  },
  progressBarSmall: {
    height: 2,
    backgroundColor: '#19211d',
    borderRadius: 1,
    marginTop: 8,
  },
  progressSmallFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 1,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    marginTop: 8,
    gap: 2,
  },
  bar: {
    flex: 1,
    backgroundColor: 'rgba(148,163,184,0.4)',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  barBlue: {
    backgroundColor: 'rgba(59,130,246,0.4)',
  },
  barGreen: {
    backgroundColor: 'rgba(34,197,94,0.4)',
  },
  barOrange: {
    backgroundColor: '#f97316',
  },
  barRed: {
    backgroundColor: 'rgba(239,68,68,0.4)',
  },
  gaugeContainer: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 48,
    height: 48,
    transform: [{ rotate: '-90deg' }],
  },
  trendCard: {
    backgroundColor: '#141420',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 192,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendDuration: {
    fontSize: 10,
    color: '#84958a',
  },
  zoneBands: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    bottom: 40,
  },
  zoneBand: {
    flex: 1,
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelSmall: {
    fontSize: 10,
    color: '#84958a',
  },
  noteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141420',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  noteText: {
    fontSize: 13,
    color: '#84958a',
  },
});