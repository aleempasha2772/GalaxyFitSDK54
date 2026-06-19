import { useState, useEffect, useCallback } from 'react';
import { computeRecovery, fetchHealthSnapshot } from '../services/HealthDashboardService';
import type { HealthSnapshot } from '../types/health';

interface UseHealthDashboardResult {
  snapshot: HealthSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHealthDashboard(): UseHealthDashboardResult {
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthSnapshot();
      console.log('[useHealthDashboard] Computed recovery score:', computeRecovery(data));
      console.log('[useHealthDashboard] Heart rate data:', data.heartRate);
      console.log('[useHealthDashboard] SpO2:', data.spo2);
      console.log('[useHealthDashboard] Activity data:', data.activity);
      console.log('[useHealthDashboard] Last exercise:', data.lastExercise);
      console.log('[useHealthDashboard] Fetched At:', data.fetchedAt);
      console.log('[useHealthDashboard] Sleep data:', data.sleep);
      console.log('[useHealthDashboard] Sleep stages:', data.sleep?.stages);
      setSnapshot(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load health data';
      setError(message);
      console.error('[useHealthDashboard]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}