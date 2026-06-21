// app/record-session.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

const { width } = Dimensions.get('window');

// ---------- Exercise data by muscle group ----------
const EXERCISES_BY_MUSCLE: Record<string, Array<{ name: string; sets: string; reps: string; icon: string }>> = {
  chest: [
    { name: 'Barbell Bench Press', sets: '4', reps: '8-12', icon: 'fitness-center' },
    { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', icon: 'online-prediction' },
    { name: 'Cable Flyes', sets: '3', reps: '15', icon: 'cable' },
    { name: 'Weighted Dips', sets: '3', reps: 'AMRAP', icon: 'weight' },
    { name: 'Push-ups (to failure)', sets: '2', reps: 'To Failure', icon: 'front-loader' },
  ],
  lats: [
    { name: 'Pull-ups', sets: '4', reps: '8-12', icon: 'fitness-center' },
    { name: 'Barbell Rows', sets: '4', reps: '8-10', icon: 'weight' },
    { name: 'Seated Cable Rows', sets: '3', reps: '12-15', icon: 'cable' },
    { name: 'Lat Pulldowns', sets: '3', reps: '10-12', icon: 'front-loader' },
  ],
  shoulder: [
    { name: 'Overhead Press', sets: '4', reps: '8-12', icon: 'fitness-center' },
    { name: 'Lateral Raises', sets: '3', reps: '15-20', icon: 'online-prediction' },
    { name: 'Rear Delt Flyes', sets: '3', reps: '15', icon: 'cable' },
    { name: 'Face Pulls', sets: '3', reps: '15', icon: 'weight' },
  ],
  legs: [
    { name: 'Barbell Squats', sets: '4', reps: '8-10', icon: 'fitness-center' },
    { name: 'Romanian Deadlifts', sets: '3', reps: '10-12', icon: 'weight' },
    { name: 'Leg Press', sets: '3', reps: '12-15', icon: 'front-loader' },
    { name: 'Walking Lunges', sets: '3', reps: '12 each', icon: 'directions-walk' },
  ],
  biceps: [
    { name: 'Barbell Curls', sets: '4', reps: '8-12', icon: 'fitness-center' },
    { name: 'Hammer Curls', sets: '3', reps: '12-15', icon: 'online-prediction' },
    { name: 'Preacher Curls', sets: '3', reps: '10-12', icon: 'cable' },
  ],
  triceps: [
    { name: 'Close-grip Bench Press', sets: '4', reps: '8-10', icon: 'fitness-center' },
    { name: 'Tricep Pushdowns', sets: '3', reps: '12-15', icon: 'cable' },
    { name: 'Overhead Extensions', sets: '3', reps: '10-12', icon: 'weight' },
  ],
  abdomen: [
    { name: 'Hanging Leg Raises', sets: '3', reps: '15-20', icon: 'fitness-center' },
    { name: 'Cable Crunches', sets: '3', reps: '15', icon: 'cable' },
    { name: 'Plank', sets: '3', reps: '60 sec', icon: 'online-prediction' },
  ],
  multi: [
    { name: 'Deadlifts', sets: '4', reps: '6-8', icon: 'fitness-center' },
    { name: 'Power Cleans', sets: '3', reps: '5', icon: 'weight' },
    { name: 'Thrusters', sets: '3', reps: '10', icon: 'front-loader' },
  ],
};

// ---------- Muscle display names ----------
const MUSCLE_LABELS: Record<string, string> = {
  chest: 'CHEST',
  lats: 'LATS',
  shoulder: 'SHOULDER',
  legs: 'LEGS',
  biceps: 'BICEPS',
  triceps: 'TRICEPS',
  abdomen: 'ABDOMEN',
  multi: 'MULTI',
};

export default function RecordSessionScreen() {
  const router = useRouter();
  const { muscle } = useLocalSearchParams<{ muscle: string }>();
  const exercises = EXERCISES_BY_MUSCLE[muscle ?? ''] ?? [];
  const muscleLabel = MUSCLE_LABELS[muscle ?? ''] ?? 'SESSION';

  // ---------- Stopwatch logic ----------
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);

  // ---------- UI ----------
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#6effc0" />
          </TouchableOpacity>
          <Text style={styles.title}>{muscleLabel} SESSION</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="#84958a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Session Controls */}
        <View style={styles.timerSection}>
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Session Time</Text>
            <Text style={styles.timerValue}>{formatTime(seconds)}</Text>

            {/* Mock Heart Rate */}
            <View style={styles.hrRow}>
              <MaterialIcons name="favorite" size={16} color="#ffb4ab" style={{ marginRight: 4 }} />
              <Text style={styles.hrText}>74 BPM</Text>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlBtn, styles.startBtn]}
                onPress={startTimer}
                disabled={isRunning}
                activeOpacity={0.7}
              >
                <MaterialIcons name="play-arrow" size={20} color="#0A0A0F" />
                <Text style={styles.controlText}>START</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlBtn, styles.stopBtn]}
                onPress={stopTimer}
                activeOpacity={0.7}
              >
                <MaterialIcons name="stop" size={20} color="#84958a" />
                <Text style={styles.stopText}>STOP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Planned Routine */}
        <View style={styles.routineSection}>
          <Text style={styles.sectionLabel}>Planned Routine</Text>
          {exercises.map((ex, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseLeft}>
                <View style={styles.exerciseIcon}>
                  <MaterialIcons name={ex.icon as any} size={24} color="#6effc0" />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetail}>{ex.sets} Sets • {ex.reps} Reps</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.checkBtn}>
                <MaterialIcons name="check-circle" size={24} color="rgba(132,149,138,0.3)" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>4,280 <Text style={styles.statUnit}>kg</Text></Text>
            <View style={styles.statTrend}>
              <MaterialIcons name="trending-up" size={14} color="#6effc0" />
              <Text style={styles.trendText}>12% vs last</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Intensity</Text>
            <Text style={styles.statValue}>88 <Text style={styles.statUnit}>%</Text></Text>
            <View style={styles.statTrend}>
              <MaterialIcons name="horizontal-rule" size={14} color="#84958a" />
              <Text style={styles.trendTextNeutral}>Stable</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 20,
    fontWeight: '300',
    color: '#6effc0',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
    marginTop: 16,
  },
  timerSection: {},
  timerCard: {
    backgroundColor: '#151d19',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '200',
    color: '#6effc0',
    letterSpacing: -2,
    marginTop: 8,
  },
  hrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  hrText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dbe5dd',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 32,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startBtn: {
    backgroundColor: '#00e5a0',
    shadowColor: '#00e5a0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  stopBtn: {
    backgroundColor: '#2e3731',
  },
  controlText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A0A0F',
  },
  stopText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#84958a',
  },
  routineSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  exerciseCard: {
    backgroundColor: '#151d19',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(110,255,192,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {},
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbe5dd',
  },
  exerciseDetail: {
    fontSize: 12,
    color: '#84958a',
    marginTop: 2,
  },
  checkBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#151d19',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#84958a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#dbe5dd',
    marginTop: 4,
  },
  statUnit: {
    fontSize: 12,
    color: '#84958a',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#6effc0',
  },
  trendTextNeutral: {
    fontSize: 12,
    color: '#84958a',
  },
});