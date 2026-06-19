export interface ActivityData {
  steps: number | null;
  distanceMeters: number | null;
  floorsClimbed: number | null;
  totalCalories: number | null;
  activeCalories: number | null;
}

export interface HeartRateData {
  current: number | null;
  resting: number | null;
}

export interface SleepData {
  durationHours: number;
  startTime: string;
  endTime: string;
  stages: Array<{
    stage: string;
    durationMinutes: number;
  }>;
}

export interface ExerciseData {
  type: string;
  durationMinutes: number;
  startTime: string;
}

/** The single object your UI consumes */
export interface HealthSnapshot {
  fetchedAt: Date;
  activity: ActivityData;
  heartRate: HeartRateData;
  spo2: number | null;
  sleep: SleepData | null;
  lastExercise: ExerciseData | null;
}