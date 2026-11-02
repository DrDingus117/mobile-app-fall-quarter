import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import WalkDetailsScreen from '@/components/walk-details-screen';
import { Link, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Handles every link that does not match a screen:
//  - /walk/101  -> shows Walk Details for walk 101
//  - /walk      -> Walk Details with "A walk ID is required."
//  - anything else -> "This link cannot be opened by the Mobile Walking Tracker."
export default function NotFoundScreen() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isWalkLink = segments[0] === 'walk';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {isWalkLink ? (
          <WalkDetailsScreen walkId={segments[1]} />
        ) : (
          <ThemedView style={styles.message}>
            <ThemedText type="title">Walk Details</ThemedText>
            <ThemedText style={styles.bold}>
              This link cannot be opened by the Mobile Walking Tracker.
            </ThemedText>
          </ThemedView>
        )}
        <Link href="/" style={styles.home}>
          <ThemedText type="code">Go to Home</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  message: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  bold: { fontWeight: '600' },
  home: { padding: 24 },
});