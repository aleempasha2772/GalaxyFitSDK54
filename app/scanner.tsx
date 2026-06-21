import { useState, useCallback } from 'react';
import {
  View, Text, Button, FlatList, StyleSheet, PermissionsAndroid,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { COLORS } from '../src/constants/theme';

const manager = new BleManager();

export default function ScannerScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
        } else {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const startScan = useCallback(() => {
    requestBluetoothPermission();
    setDevices([]);
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }
      if (device && device.name) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }, []);

  const connectToDevice = async (device: Device) => {
    try {
      setConnectingId(device.id);
      if (connectedDevice) {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setHeartRate(null);
      }

      const connected = await device.connect();
      setConnectedDevice(connected);
      await connected.discoverAllServicesAndCharacteristics();

      const HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
      const HR_CHAR_UUID    = '00002a37-0000-1000-8000-00805f9b34fb';

      connected.monitorCharacteristicForService(
        HR_SERVICE_UUID,
        HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Monitor error:', error);
            return;
          }
          if (characteristic?.value) {
            const raw = Buffer.from(characteristic.value, 'base64');
            const flags = raw[0];
            let hr: number;
            if (flags & 0x01) {
              hr = raw.readUInt16LE(1);
            } else {
              hr = raw[1];
            }
            setHeartRate(hr);
          }
        }
      );
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setConnectingId(null);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setHeartRate(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {connectedDevice && (
        <View style={styles.hrContainer}>
          <Text style={styles.hrLabel}>Connected: {connectedDevice.name}</Text>
          <Text style={styles.hrValue}>
            {heartRate !== null ? `♥ ${heartRate} BPM` : '-- BPM'}
          </Text>
          <Button title="Disconnect" onPress={disconnectDevice} color="#ff4444" />
        </View>
      )}

      <Text style={styles.title}>Available Devices</Text>
      <Button
        title={scanning ? 'Scanning...' : 'Scan for Devices'}
        onPress={startScan}
        disabled={scanning}
      />
      {scanning && <ActivityIndicator style={{ marginVertical: 10 }} />}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{item.name || 'Unnamed'}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </View>
            <Button
              title={
                connectingId === item.id
                  ? 'Connecting...'
                  : connectedDevice?.id === item.id
                  ? 'Connected'
                  : 'Connect'
              }
              onPress={() => connectToDevice(item)}
              disabled={connectingId === item.id || connectedDevice?.id === item.id}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  hrContainer: {
    backgroundColor: '#f0f8ff', padding: 15, borderRadius: 10, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#cce5ff',
  },
  hrLabel: { fontSize: 16, color: '#333' },
  hrValue: { fontSize: 40, fontWeight: 'bold', color: '#e74c3c', marginVertical: 5 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 10, color: '#F2F2FF' },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  deviceName: { fontWeight: 'bold', fontSize: 16, color: '#dbe5dd' },
  deviceId: { color: '#84958a', fontSize: 12, marginTop: 2 },
});