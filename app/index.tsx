import { useEffect, useState } from 'react';
import { Text, ActivityIndicator, Button, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { checkPermissions } from '../services/HealthConnectService';
import { COLORS } from '../src/constants/theme';

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
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Checking Health Connect...</Text>
      </SafeAreaView>
    );
  }

  if (!available) {
    return (
      <SafeAreaView style={styles.centered}>
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
      </SafeAreaView>
    );
  }

  // Fallback (normally the useEffect will redirect)
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator size="large" />
      <Text style={styles.statusText}>Preparing...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
  statusText: { color: '#dbe5dd', marginTop: 12 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#F2F2FF' },
  errorMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#84958a' },
});