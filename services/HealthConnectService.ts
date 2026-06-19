// services/HealthConnectService.ts
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
} from 'react-native-health-connect';

// ---------- Record types ----------
const RECORD_TYPES = [
  'ExerciseSession',
  'HeartRate',
  'RestingHeartRate',
  'SleepSession',
  'OxygenSaturation',
  'Steps',
  'Distance',
  'FloorsClimbed',
  'TotalCaloriesBurned',
  'ActiveCaloriesBurned',
] as const;

type RecordType = (typeof RECORD_TYPES)[number];

// ---------- Permission mapping ----------
const PERMISSION_TO_RECORD: Record<string, string> = {
  'androidx.health.permission.ACTIVITY_READ': 'ExerciseSession',
  'androidx.health.permission.HEART_RATE_READ': 'HeartRate',
  'androidx.health.permission.SLEEP_READ': 'SleepSession',
  'androidx.health.permission.OXYGEN_SATURATION_READ': 'OxygenSaturation',
  'androidx.health.permission.STEPS_READ': 'Steps',
  'androidx.health.permission.DISTANCE_READ': 'Distance',
  'androidx.health.permission.CALORIES_READ': 'TotalCaloriesBurned',
  'androidx.health.permission.READ_FLOORS_CLIMBED': 'FloorsClimbed',
  'androidx.health.permission.READ_RESTING_HEART_RATE': 'RestingHeartRate',
  'androidx.health.permission.READ_ACTIVE_CALORIES_BURNED': 'ActiveCaloriesBurned',
};

export type PermissionStatus = 'granted' | 'denied';

// ---------- Init ----------
export async function initializeHealthConnect(): Promise<boolean> {
  try {
    const result = await initialize();
    console.log('Health Connect initialized:', result);
    return result;
  } catch (error) {
    console.error('Health Connect init error:', error);
    return false;
  }
}

// ---------- Permission helpers ----------
export async function checkPermissions(): Promise<Record<RecordType, PermissionStatus>> {
  const granted = await getGrantedPermissions();
  const grantedReadTypes = new Set(
    (granted as Array<{ recordType: string; accessType: string }>)
      .filter(p => p.accessType === 'read')
      .map(p => p.recordType),
  );
  return Object.fromEntries(
    RECORD_TYPES.map(rt => [rt, grantedReadTypes.has(rt) ? 'granted' : 'denied']),
  ) as Record<RecordType, PermissionStatus>;
}

export async function requestAllPermissions(): Promise<boolean> {
  const status = await checkPermissions();
  const notGranted = RECORD_TYPES.filter(rt => status[rt] !== 'granted');
  if (notGranted.length === 0) return true;

  try {
    await requestPermission(
      notGranted.map(recordType => ({ recordType, accessType: 'read' as const })) as any,
    );
    const newStatus = await checkPermissions();
    return RECORD_TYPES.every(rt => newStatus[rt] === 'granted');
  } catch (error) {
    console.error('[HC] Permission request threw:', error);
    return false;
  }
}

// ---------- Data readers (today) ----------
async function readToday(recordType: string, aggregate: (records: any[]) => number): Promise<number | null> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  try {
    const result = await readRecords(recordType as any, {
      timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
    });
    if (result.records.length === 0) return null;
    return aggregate(result.records);
  } catch (error) {
    console.error(`Failed to read ${recordType}:`, error);
    return null;
  }
}

export const readTodaySteps = () =>
  readToday('Steps', recs => {
    console.log('Step records:', recs);

    const totalSteps = recs.reduce(
      (s: number, r: any) => s + r.count,
      0
    );

    console.log('Total steps:', totalSteps);

    return totalSteps;
  });
export const readTodayDistance = () =>
  readToday('Distance', recs => {
    const totalDistance = recs.reduce(
      (s: number, r: any) => s + r.distance.inMeters,
      0
    );

    console.log('Distance:', totalDistance);

    return totalDistance;
});
export const readTodayFloorsClimbed = () => readToday('FloorsClimbed', recs => recs.reduce((s: number, r: any) => s + r.floors, 0));
export const readTodayTotalCalories = () => readToday('TotalCaloriesBurned', recs => recs.reduce((s: number, r: any) => s + r.energy.inKilocalories, 0));
export const readTodayActiveCalories = () => readToday('ActiveCaloriesBurned', recs => recs.reduce((s: number, r: any) => s + r.energy.inKilocalories, 0));

// ---------- Latest single-value readers ----------
async function readLatest<T>(recordType: string, extract: (record: any) => T | null): Promise<T | null> {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h
  try {
    const result = await readRecords(recordType as any, {
      timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
      ascendingOrder: false,
      pageSize: 1,
    });
    if (result.records.length === 0) return null;
    return extract(result.records[0]);
  } catch (error) {
    console.error(`Failed to read latest ${recordType}:`, error);
    return null;
  }
}

export const readLastHeartRate = () => readLatest('HeartRate', (r: any) => r.samples?.[0]?.beatsPerMinute ?? null);
export const readLastRestingHeartRate = () => readLatest('RestingHeartRate', (r: any) => r.samples?.[0]?.beatsPerMinute ?? null);
export const readLastSpO2 = () => readLatest('OxygenSaturation', (r: any) => r.samples?.[0]?.percentage ?? null);
// Sleep session (most recent in past week)
export async function readLastSleepSession(): Promise<any | null> {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const result = await readRecords('SleepSession', {
      timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
      ascendingOrder: false,
      pageSize: 1,
    });
    return result.records.length > 0 ? result.records[0] : null;
  } catch (error) {
    console.error('Failed to read sleep session:', error);
    return null;
  }
}

// Last exercise session (most recent workout)
export async function readLastExerciseSession(): Promise<any | null> {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const result = await readRecords('ExerciseSession', {
      timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
      ascendingOrder: false,
      pageSize: 1,
    });
    return result.records.length > 0 ? result.records[0] : null;
  } catch (error) {
    console.error('Failed to read exercise session:', error);
    return null;
  }
}