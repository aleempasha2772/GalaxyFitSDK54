// app/muscle-select.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2; // 2 columns with padding and gap

interface MuscleGroup {
  id: string;
  label: string;
  icon: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'chest', label: 'Chest', icon: 'fitness-center' },
  { id: 'lats', label: 'Lats', icon: 'back-hand' },
  { id: 'shoulder', label: 'Shoulder', icon: 'person-apron' },
  { id: 'legs', label: 'Legs', icon: 'directions-run' },
  { id: 'biceps', label: 'Biceps', icon: 'exercise' },
  { id: 'triceps', label: 'Triceps', icon: 'sports-gymnastics' },
  { id: 'abdomen', label: 'Abdomen', icon: 'grid-view' },
  { id: 'multi', label: 'Multi', icon: 'all-inclusive' },
];

export default function MuscleSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    // Future: navigate to exercise list or start workout
    router.push({ pathname: '/record-session', params: { muscle: id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is handled by Stack Navigator */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Target Area</Text>
          <Text style={styles.sectionTitle}>Select Muscle Group</Text>
        </View>

        {/* Muscle Group Grid */}
        <View style={styles.grid}>
          {MUSCLE_GROUPS.map((muscle) => (
            <TouchableOpacity
              key={muscle.id}
              style={[
                styles.card,
                selected === muscle.id && styles.cardSelected,
              ]}
              onPress={() => handleSelect(muscle.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconCircle,
                  selected === muscle.id && styles.iconCircleSelected,
                ]}
              >
                <MaterialIcons
                  name={muscle.icon as any}
                  size={28}
                  color={selected === muscle.id ? '#0d1511' : '#6effc0'}
                  style={selected === muscle.id && { color: '#0d1511' }}
                />
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  selected === muscle.id && styles.cardLabelSelected,
                ]}
              >
                {muscle.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipRow}>
            <MaterialIcons
              name="info"
              size={20}
              color="#00e5a0"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Training Tip</Text>
              <Text style={styles.tipText}>
                Select "Multi" for compound movements like deadlifts or cleans that engage multiple chains simultaneously.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 32,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#bacbbf', // on-surface-variant
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '300',
    color: '#dbe5dd', // on-surface
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 32,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#19211d', // surface-container
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    aspectRatio: 1,
  },
  cardSelected: {
    backgroundColor: '#232c27', // surface-container-high
    borderColor: '#6effc0', // primary
    shadowColor: '#6effc0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(110,255,192,0.1)', // primary/10
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleSelected: {
    backgroundColor: '#6effc0', // primary
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbe5dd', // on-surface
    letterSpacing: -0.3,
  },
  cardLabelSelected: {
    color: '#6effc0', // primary
  },
  tipCard: {
    backgroundColor: 'rgba(35,44,39,0.4)', // surface-container-high/40
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dbe5dd',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#bacbbf', // on-surface-variant
  },
});