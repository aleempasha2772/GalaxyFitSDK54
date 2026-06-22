import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { icon: 'home',           label: 'Home',     route: '/dashboard' },
  { icon: 'spa',            label: 'Recovery', route: '/recovery' },
  { icon: 'bed',            label: 'Sleep',    route: '/sleep-analysis' },
  { icon: 'insights',       label: 'Training', route: '/training-load' },
  { icon: 'favorite',       label: 'Metrics',  route: '/health-metrics' },
] as const;

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { bottom: insets.bottom + 8 }]}>
      {TABS.map(({ icon, label, route }) => {
        const active = pathname === route;
        return (
          <TouchableOpacity
            key={label}
            style={styles.navItem}
            onPress={() => { if (route) router.push(route); }}
          >
            <MaterialIcons
              name={icon as any}
              size={24}
              color={active ? '#6effc0' : '#84958a'}
              style={active ? styles.activeIcon : undefined}
            />
            <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(20,20,32,0.8)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#84958a',
    marginTop: 4,
  },
  activeNavLabel: { color: '#6effc0' },
  activeIcon: {
    textShadowColor: 'rgba(110,255,192,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
