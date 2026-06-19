import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { checkPermissions } from '../services/HealthConnectService';

export default function HomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(true); // We assume initialized in layout

  useEffect(() => {
    (async () => {
      try {
        const status = await checkPermissions();
        const allGranted = Object.values(status).every(s => s === 'granted');
        if (allGranted) {
          router.replace('/dashboard');
        } else {
          router.replace('/health-permissions');
        }
      } catch (error) {
        // If checkPermissions fails, it might be because Health Connect is missing
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Checking Health Connect...</Text>
      </View>
    );
  }

  if (!available) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Health Connect Required</Text>
        <Text style={styles.errorMessage}>
          This app requires the Health Connect app. Please install it from the Play Store.
        </Text>
        <Button
          title="Install Health Connect"
          onPress={() => {
            Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');
          }}
        />
      </View>
    );
  }

  // Fallback (normally the useEffect will redirect)
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" />
      <Text>Preparing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  errorMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#555' },
});