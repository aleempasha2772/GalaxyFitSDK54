import { readRecords } from 'react-native-health-connect';

// ---------- Today aggregators ----------
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
    console.error(`[HealthConnectRepo] Failed to read ${recordType}:`, error);
    return null;
  }
}

export const readTodaySteps = () =>
  readToday('Steps', recs => recs.reduce((s: number, r: any) => s + r.count, 0));

export const readTodayDistance = () =>
  readToday('Distance', recs => recs.reduce((s: number, r: any) => s + r.distance.inMeters, 0));

export const readTodayFloorsClimbed = () =>
  readToday('FloorsClimbed', recs => recs.reduce((s: number, r: any) => s + r.floors, 0));

export const readTodayTotalCalories = () =>
  readToday('TotalCaloriesBurned', recs => recs.reduce((s: number, r: any) => s + r.energy.inKilocalories, 0));

export const readTodayActiveCalories = () =>
  readToday('ActiveCaloriesBurned', recs => recs.reduce((s: number, r: any) => s + r.energy.inKilocalories, 0));

// ---------- Latest single‑value readers ----------
async function readLatest<T>(recordType: string, extract: (record: any) => T | null): Promise<T | null> {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  try {
    const result = await readRecords(recordType as any, {
      timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
      ascendingOrder: false,
      pageSize: 1,
    });
    if (result.records.length === 0) return null;
    return extract(result.records[0]);
  } catch (error) {
    console.error(`[HealthConnectRepo] Failed to read latest ${recordType}:`, error);
    return null;
  }
}

export const readLastHeartRate = () =>
  readLatest('HeartRate', (r: any) => r.samples?.[0]?.beatsPerMinute ?? null);

export const readLastRestingHeartRate = () =>
  readLatest('RestingHeartRate', (r: any) => r.samples?.[0]?.beatsPerMinute ?? null);

export const readLastSpO2 = () =>
  readLatest('OxygenSaturation', (r: any) => r.samples?.[0]?.percentage ?? null);

export const readLastStress = () =>
  readLatest('Stress', (r: any) => r.level ?? null);

// ---------- Session readers ----------
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
    console.error('[HealthConnectRepo] Failed to read sleep:', error);
    return null;
  }
}

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
    console.error('[HealthConnectRepo] Failed to read exercise:', error);
    return null;
  }
}