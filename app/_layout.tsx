import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { initializeHealthConnect } from '../services/HealthConnectService';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="health-permissions" options={{ title: 'Permissions',headerShown: false, }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard',headerShown: false, }} />
      <Stack.Screen name="scanner" options={{ title: 'BLE Scanner',headerShown: false, }} />
      <Stack.Screen name="second" options={{ title: 'Second Screen' }} />
      <Stack.Screen name="workouts" options={{ headerShown: false }} />
      <Stack.Screen name="live-workout" options={{ headerShown: false }} />
      <Stack.Screen name="muscle-select" options={{ headerShown: false }} />
    </Stack>
  );
}