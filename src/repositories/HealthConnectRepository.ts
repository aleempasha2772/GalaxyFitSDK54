// repositories/HealthConnectRepository.ts

import { readRecords, aggregateRecord } from 'react-native-health-connect';

/** Matches "Aleem's A35, Samsung Health" in the Health Connect app */
const SAMSUNG_HEALTH_ORIGIN = 'com.sec.android.app.shealth';

function getTodayTimeRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    operator: 'between' as const,
    startTime: start.toISOString(),
    endTime: now.toISOString(),
  };
}

async function aggregateToday(
  recordType: string,
  extract: (result: any) => number | null,
  dataOriginFilter?: string[]
): Promise<number | null> {
  try {
    const result = await aggregateRecord({
      recordType: recordType as any,
      timeRangeFilter: getTodayTimeRange(),
      ...(dataOriginFilter ? { dataOriginFilter } : {}),
    });
    if (!result) return null;
    return extract(result);
  } catch (error) {
    console.error(`[HealthConnectRepo] Failed to aggregate ${recordType}:`, error);
    return null;
  }
}

/**
 * Samsung Health only — matches the Health Connect "Entries" screen total.
 *
 * We sum raw records instead of using aggregateRecord(COUNT_TOTAL) on purpose:
 * aggregateRecord de-duplicates overlapping step intervals, which makes the
 * number LOWER than what Health Connect / Samsung Health display (e.g. 7,514
 * instead of 8,104). The Entries screen shows a plain sum, so we do the same.
 */
export async function readTodaySteps(): Promise<number | null> {
  try {
    const result = await readRecords('Steps', {
      timeRangeFilter: getTodayTimeRange(),
      dataOriginFilter: [SAMSUNG_HEALTH_ORIGIN],
    });
    if (result.records.length === 0) return null;
    return result.records.reduce((sum, r: any) => sum + r.count, 0);
  } catch (error) {
    console.error('[HealthConnectRepo] Failed to read steps:', error);
    return null;
  }
}

export const readTodayDistance = () =>
  aggregateToday(
    'Distance',
    (res) => res?.DISTANCE?.inMeters ?? null,
    [SAMSUNG_HEALTH_ORIGIN]
  );

export const readTodayFloorsClimbed = () =>
  aggregateToday(
    'FloorsClimbed',
    (res) => res?.FLOORS_CLIMBED_TOTAL ?? null,
    [SAMSUNG_HEALTH_ORIGIN]
  );

/** Basal + active calories often come from system origins, not Samsung */
export const readTodayTotalCalories = () =>
  aggregateToday('TotalCaloriesBurned', (res) => res?.ENERGY_TOTAL?.inKilocalories ?? null);

export const readTodayActiveCalories = () =>
  aggregateToday(
    'ActiveCaloriesBurned',
    (res) => res?.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? null
  );

async function readLatest<T>(
  recordType: string,
  extract: (record: any) => T | null,
  lookbackDays = 7
): Promise<T | null> {
  const now = new Date();
  const start = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  try {
    const result = await readRecords(recordType as any, {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
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
  readLatest('HeartRate', (r) => r.samples?.[0]?.beatsPerMinute ?? null, 1);

export const readLastRestingHeartRate = () =>
  readLatest('RestingHeartRate', (r) => r.beatsPerMinute ?? null);

export const readLastSpO2 = () =>
  readLatest('OxygenSaturation', (r) => r.percentage ?? null);

/**
 * Samsung Health writes interrupted/fragmented sleep as SEPARATE SleepSession
 * records (e.g. 03:27-05:31, 05:47-06:27, 07:18-07:54). Reading a single record
 * (pageSize: 1) only captured the newest fragment, so the dashboard showed ~36m
 * instead of the real night total. We read all sessions, group the most recent
 * night (fragments within MAX_GAP_MS of each other), and merge them.
 */
const SLEEP_FRAGMENT_MAX_GAP_MS = 3 * 60 * 60 * 1000; // 3h gap = same night

export async function readLastSleepSession(): Promise<any | null> {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const result = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
      ascendingOrder: false, // newest first
    });
    if (result.records.length === 0) return null;

    // Group the most recent night: walk from the newest session backwards,
    // keeping fragments whose end is within MAX_GAP of the group's earliest start.
    const sessions = result.records as any[];
    const group = [sessions[0]];
    let earliestStart = new Date(sessions[0].startTime).getTime();
    for (let i = 1; i < sessions.length; i++) {
      const end = new Date(sessions[i].endTime).getTime();
      if (earliestStart - end > SLEEP_FRAGMENT_MAX_GAP_MS) break;
      group.push(sessions[i]);
      earliestStart = Math.min(earliestStart, new Date(sessions[i].startTime).getTime());
    }

    // Order chronologically (oldest fragment first) for a sensible timeline.
    group.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Summed asleep time = sum of each fragment's span (gaps between fragments
    // are awake time and must NOT be counted).
    const durationMinutes = group.reduce(
      (sum, s) =>
        sum + Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60_000),
      0
    );

    return {
      startTime: group[0].startTime,
      endTime: group[group.length - 1].endTime,
      stages: group.flatMap((s) => s.stages ?? []),
      durationMinutes, // consumed by mapSleep
    };
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
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
      ascendingOrder: false,
      pageSize: 1,
    });
    return result.records.length > 0 ? result.records[0] : null;
  } catch (error) {
    console.error('[HealthConnectRepo] Failed to read exercise:', error);
    return null;
  }
}
