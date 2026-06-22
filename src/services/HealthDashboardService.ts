import {
  readTodaySteps,
  readTodayDistance,
  readTodayFloorsClimbed,
  readTodayTotalCalories,
  readTodayActiveCalories,
  readLastHeartRate,
  readLastRestingHeartRate,
  readLastSpO2,
  readLastSleepSession,
  readLastExerciseSession,
} from '../repositories/HealthConnectRepository';
import type { HealthSnapshot, SleepData, ExerciseData } from '../types/health';


const SLEEP_STAGE_LABELS: Record<number, string> = {
    1: 'Awake',
    2: 'Sleep',
    3: 'Out‑of‑bed',
    4: 'Light',
    5: 'Deep',
    6: 'REM',
  };
// ---------- Private mappers ----------
function mapSleep(raw: any): SleepData | null {
  if (!raw) return null;
  const start = new Date(raw.startTime);
  const end = new Date(raw.endTime);
  // Prefer the summed asleep minutes from the repository (handles fragmented
  // Samsung sessions); fall back to the envelope span for single sessions.
  const durationHours =
    raw.durationMinutes != null
      ? Math.round((raw.durationMinutes / 60) * 10) / 10
      : Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 10) / 10;

  return {
    durationHours,
    startTime: raw.startTime,
    endTime: raw.endTime,
    stages: (raw.stages ?? []).map((s: any) => ({
      stage: SLEEP_STAGE_LABELS[s.stage] ?? `Stage ${s.stage}`,
      durationMinutes: Math.round(
        (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60_000
      ),
    })),
  };
}

const EXERCISE_TYPE_LABELS: Record<number, string> = {
  1: 'Running',
  2: 'Walking',
  3: 'Cycling',
  4: 'Swimming',
  8: 'Hiking',
  16: 'Elliptical',
  22: 'Treadmill',
  79: 'Weight Training',
  // add others if needed
};

function mapExercise(raw: any): ExerciseData | null {
  if (!raw) return null;
  const start = new Date(raw.startTime);
  const end = new Date(raw.endTime);
  return {
    type: EXERCISE_TYPE_LABELS[raw.exerciseType] ?? `Workout ${raw.exerciseType}`,
    durationMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
    startTime: raw.startTime,
  };
}

/** Compute a 0‑100 recovery score based on sleep and current HR */
export function computeRecovery(snapshot: HealthSnapshot): number {
  let score = 0;
  if (snapshot.sleep) {
    score += Math.min((snapshot.sleep.durationHours / 8) * 50, 50);
  }
  if (snapshot.heartRate.current != null) {
    score += Math.max(0, (70 - snapshot.heartRate.current) * 2);
  }
  return Math.round(Math.min(score, 100));
}

/** Fetch all metrics, map to DTO, return complete snapshot */
export async function fetchHealthSnapshot(): Promise<HealthSnapshot> {
  const [
    steps,
    distanceMeters,
    floorsClimbed,
    totalCalories,
    activeCalories,
    heartRateCurrent,
    heartRateResting,
    spo2,
    sleepRaw,
    exerciseRaw,
  ] = await Promise.all([
    readTodaySteps(),
    readTodayDistance(),
    readTodayFloorsClimbed(),
    readTodayTotalCalories(),
    readTodayActiveCalories(),
    readLastHeartRate(),
    readLastRestingHeartRate(),
    readLastSpO2(),
    readLastSleepSession(),
    readLastExerciseSession(),
  ]);

  

  return {
    fetchedAt: new Date(),
    activity: {
      steps,
      distanceMeters,
      floorsClimbed,
      totalCalories,
      activeCalories,
    },
    heartRate: {
      current: heartRateCurrent,
      resting: heartRateResting,
    },
    spo2,
    sleep: mapSleep(sleepRaw),
    lastExercise: mapExercise(exerciseRaw),
  };
}