// services/HealthPermissionsService.ts
import {
  initialize,
  requestPermission,
  getGrantedPermissions,
} from 'react-native-health-connect';

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

export type PermissionStatus = 'granted' | 'denied';

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

export async function checkPermissions(): Promise<Record<string, PermissionStatus>> {
  try {
    const granted = await getGrantedPermissions();
    console.log('[checkPermissions] Raw granted:', JSON.stringify(granted));
    const grantedReadTypes = new Set(
      (granted as Array<{ recordType: string; accessType: string }>)
        .filter(p => p.accessType === 'read')
        .map(p => p.recordType)
    );
    const result: Record<string, PermissionStatus> = {};
    for (const rt of RECORD_TYPES) {
      result[rt] = grantedReadTypes.has(rt) ? 'granted' : 'denied';
    }
    console.log('[checkPermissions] Result:', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('[checkPermissions] Error:', error);
    return Object.fromEntries(RECORD_TYPES.map(rt => [rt, 'denied'])) as Record<string, PermissionStatus>;
  }
}

export async function requestAllPermissions(): Promise<boolean> {
  console.log('[requestAllPermissions] Start');
  const status = await checkPermissions();
  console.log('[requestAllPermissions] Initial status:', JSON.stringify(status));

  const notGranted = RECORD_TYPES.filter(rt => status[rt] !== 'granted');
  console.log('[requestAllPermissions] Not granted:', notGranted);

  if (notGranted.length === 0) {
    console.log('[requestAllPermissions] All already granted');
    return true;
  }

  try {
    const permissionsToRequest = notGranted.map(rt => ({
      recordType: rt,
      accessType: 'read' as const,
    }));
    console.log('[requestAllPermissions] Calling requestPermission with:', JSON.stringify(permissionsToRequest));

    const result = await requestPermission(permissionsToRequest as any);
    console.log('[requestAllPermissions] Native result:', JSON.stringify(result));

    const newStatus = await checkPermissions();
    console.log('[requestAllPermissions] New status:', JSON.stringify(newStatus));
    return RECORD_TYPES.every(rt => newStatus[rt] === 'granted');
  } catch (error) {
    console.error('[requestAllPermissions] Exception:', error);
    return false;
  }
}