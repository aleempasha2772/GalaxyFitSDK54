import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';

export default function SecondScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is the second screen!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { fontSize: 18, color: '#dbe5dd' },
});
