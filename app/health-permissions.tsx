import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { checkPermissions, requestAllPermissions } from '../src/services/HealthPermissionsService';

export default function HealthPermissionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await checkPermissions();
      const allGranted = Object.values(status).every(s => s === 'granted');
      setGranted(allGranted);
      setLoading(false);
      if (allGranted) {
        router.replace('/dashboard');
      }
    })();
  }, []);

  const handleRequest = async () => {
  console.log('[Permissions] handleRequest triggered');
  setLoading(true);

  try {
    console.log('[Permissions] Calling requestAllPermissions...');
    const granted = await requestAllPermissions();
    console.log('[Permissions] requestAllPermissions returned:', granted);
    
    if (granted) {
      console.log('[Permissions] All permissions granted — checking status...');
      const newStatus = await checkPermissions();
      console.log('[Permissions] New status:', JSON.stringify(newStatus));
      router.replace('/dashboard');
    } else {
      console.warn('[Permissions] Not all permissions were granted. Current status:');
      const currentStatus = await checkPermissions();
      console.warn(JSON.stringify(currentStatus));
    }
  } catch (error) {
    console.error('[Permissions] Error during request:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Connect Setup</Text>
      <Text style={styles.description}>
        To show your fitness data from Galaxy Fit3, we need access to:
      </Text>
      <View style={styles.bullets}>
        <Text>• Steps & Distance</Text>
        <Text>• Heart Rate</Text>
        <Text>• Sleep</Text>
        <Text>• Blood Oxygen</Text>
        <Text>• Calories Burned</Text>
      </View>

      {granted ? (
        <>
          <Text style={styles.granted}>✅ All permissions granted!</Text>
          <Button title="Go to Dashboard" onPress={() => router.replace('/dashboard')} />
        </>
      ) : (
        <Button 
          title="Grant Permissions" 
          onPress={() => {
            console.log('[PermissionsScreen] Button pressed');
            handleRequest();
          }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  description: { fontSize: 16, marginBottom: 15, color: '#555' },
  bullets: { marginBottom: 25 },
  granted: { fontSize: 18, color: 'green', marginBottom: 15 },
});