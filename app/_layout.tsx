import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeHealthConnect } from '../services/HealthConnectService';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initializeHealthConnect();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.background }}>
    <Stack screenOptions={{ contentStyle: { backgroundColor: COLORS.background } }}>
      
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="health-permissions" options={{ title: 'Permissions',headerShown: false, }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard',headerShown: false, }} />
      <Stack.Screen name="scanner" options={{ title: 'BLE Scanner',headerShown: false, }} />
      <Stack.Screen name="second" options={{ title: 'Second Screen' }} />
      <Stack.Screen name="workouts" options={{ headerShown: false }} />
      <Stack.Screen name="live-workout" options={{ headerShown: false }} />
      <Stack.Screen name="muscle-select" options={{ headerShown: false }} />
      <Stack.Screen name="record-session" options={{ headerShown: false }} />
    </Stack>
    </SafeAreaProvider>
  );
}